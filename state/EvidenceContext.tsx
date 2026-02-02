'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import SHA256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';

export type EvidenceEventType =
  | 'project.created'
  | 'identities.imported'
  | 'check.started'
  | 'check.completed'
  | 'action.marked_done'
  | 'evidence.exported';

export interface EvidenceEvent {
  id: string;
  type: EvidenceEventType;
  timestamp: string;
  data: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

interface EvidenceState {
  events: EvidenceEvent[];
  isIntegrityValid: boolean;
}

type EvidenceAction =
  | { type: 'APPEND_EVENT'; payload: EvidenceEvent }
  | { type: 'SET_INTEGRITY'; payload: boolean }
  | { type: 'CLEAR' };

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function computeHash(
  event: Omit<EvidenceEvent, 'hash'>,
  previousHash: string
): string {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    data: event.data,
    previousHash,
  });
  return SHA256(payload).toString();
}

const initialState: EvidenceState = {
  events: [],
  isIntegrityValid: true,
};

function evidenceReducer(state: EvidenceState, action: EvidenceAction): EvidenceState {
  switch (action.type) {
    case 'APPEND_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'SET_INTEGRITY':
      return { ...state, isIntegrityValid: action.payload };

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

interface EvidenceContextValue extends EvidenceState {
  appendEvent: (type: EvidenceEventType, data: Record<string, unknown>) => EvidenceEvent;
  verifyIntegrity: () => boolean;
  clear: () => void;
  getEventsByType: (type: EvidenceEventType) => EvidenceEvent[];
  exportTimeline: () => {
    events: EvidenceEvent[];
    exportedAt: string;
    integrityValid: boolean;
  };
}

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

interface EvidenceProviderProps {
  children: ReactNode;
}

export function EvidenceProvider({ children }: EvidenceProviderProps) {
  const [state, dispatch] = useReducer(evidenceReducer, initialState);

  const appendEvent = useCallback((
    type: EvidenceEventType,
    data: Record<string, unknown>
  ): EvidenceEvent => {
    const previousHash = state.events.length > 0
      ? state.events[state.events.length - 1].hash
      : GENESIS_HASH;

    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const event: Omit<EvidenceEvent, 'hash'> = {
      id,
      type,
      timestamp,
      data,
      previousHash,
    };

    const hash = computeHash(event, previousHash);

    const fullEvent: EvidenceEvent = {
      ...event,
      hash,
    };

    dispatch({ type: 'APPEND_EVENT', payload: fullEvent });

    return fullEvent;
  }, [state.events]);

  const verifyIntegrity = useCallback((): boolean => {
    if (state.events.length === 0) {
      dispatch({ type: 'SET_INTEGRITY', payload: true });
      return true;
    }

    let expectedPreviousHash = GENESIS_HASH;

    for (const event of state.events) {
      if (event.previousHash !== expectedPreviousHash) {
        dispatch({ type: 'SET_INTEGRITY', payload: false });
        return false;
      }

      const computedHash = computeHash(
        {
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          data: event.data,
          previousHash: event.previousHash,
        },
        expectedPreviousHash
      );

      if (computedHash !== event.hash) {
        dispatch({ type: 'SET_INTEGRITY', payload: false });
        return false;
      }

      expectedPreviousHash = event.hash;
    }

    dispatch({ type: 'SET_INTEGRITY', payload: true });
    return true;
  }, [state.events]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const getEventsByType = useCallback((type: EvidenceEventType): EvidenceEvent[] => {
    return state.events.filter(e => e.type === type);
  }, [state.events]);

  const exportTimeline = useCallback(() => {
    const integrityValid = verifyIntegrity();
    return {
      events: state.events,
      exportedAt: new Date().toISOString(),
      integrityValid,
    };
  }, [state.events, verifyIntegrity]);

  const value: EvidenceContextValue = {
    ...state,
    appendEvent,
    verifyIntegrity,
    clear,
    getEventsByType,
    exportTimeline,
  };

  return (
    <EvidenceContext.Provider value={value}>
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidenceContext(): EvidenceContextValue {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error('useEvidenceContext must be used within an EvidenceProvider');
  }
  return context;
}
