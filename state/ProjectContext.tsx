'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import {
  Project,
  Identity,
  CheckResult,
  CheckStatus,
  Recommendation,
} from '@/services/api/types';
import { AggregatedStats, aggregateResults } from '@/domain/scoring';

interface ProjectState {
  project: Project | null;
  identities: Identity[];
  results: CheckResult[];
  recommendations: Recommendation[];
  checkStatus: CheckStatus | null;
  aggregatedStats: AggregatedStats | null;
  isLoading: boolean;
  error: string | null;
}

type ProjectAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'SET_IDENTITIES'; payload: Identity[] }
  | { type: 'ADD_IDENTITIES'; payload: Identity[] }
  | { type: 'SET_RESULTS'; payload: CheckResult[] }
  | { type: 'UPDATE_RESULT'; payload: CheckResult }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'UPDATE_RECOMMENDATION'; payload: Recommendation }
  | { type: 'SET_CHECK_STATUS'; payload: CheckStatus | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: ProjectState = {
  project: null,
  identities: [],
  results: [],
  recommendations: [],
  checkStatus: null,
  aggregatedStats: null,
  isLoading: false,
  error: null,
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload, error: null };

    case 'SET_IDENTITIES':
      return { ...state, identities: action.payload };

    case 'ADD_IDENTITIES':
      return {
        ...state,
        identities: [...state.identities, ...action.payload],
      };

    case 'SET_RESULTS': {
      const aggregatedStats = aggregateResults(action.payload);
      return { ...state, results: action.payload, aggregatedStats };
    }

    case 'UPDATE_RESULT': {
      const results = state.results.map(r =>
        r.id === action.payload.id ? action.payload : r
      );
      const aggregatedStats = aggregateResults(results);
      return { ...state, results, aggregatedStats };
    }

    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };

    case 'UPDATE_RECOMMENDATION':
      return {
        ...state,
        recommendations: state.recommendations.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'SET_CHECK_STATUS':
      return { ...state, checkStatus: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface ProjectContextValue extends ProjectState {
  setProject: (project: Project) => void;
  setIdentities: (identities: Identity[]) => void;
  addIdentities: (identities: Identity[]) => void;
  setResults: (results: CheckResult[]) => void;
  updateResult: (result: CheckResult) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  updateRecommendation: (recommendation: Recommendation) => void;
  setCheckStatus: (status: CheckStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const setProject = useCallback((project: Project) => {
    dispatch({ type: 'SET_PROJECT', payload: project });
  }, []);

  const setIdentities = useCallback((identities: Identity[]) => {
    dispatch({ type: 'SET_IDENTITIES', payload: identities });
  }, []);

  const addIdentities = useCallback((identities: Identity[]) => {
    dispatch({ type: 'ADD_IDENTITIES', payload: identities });
  }, []);

  const setResults = useCallback((results: CheckResult[]) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, []);

  const updateResult = useCallback((result: CheckResult) => {
    dispatch({ type: 'UPDATE_RESULT', payload: result });
  }, []);

  const setRecommendations = useCallback((recommendations: Recommendation[]) => {
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
  }, []);

  const updateRecommendation = useCallback((recommendation: Recommendation) => {
    dispatch({ type: 'UPDATE_RECOMMENDATION', payload: recommendation });
  }, []);

  const setCheckStatus = useCallback((status: CheckStatus | null) => {
    dispatch({ type: 'SET_CHECK_STATUS', payload: status });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: ProjectContextValue = {
    ...state,
    setProject,
    setIdentities,
    addIdentities,
    setResults,
    updateResult,
    setRecommendations,
    updateRecommendation,
    setCheckStatus,
    setLoading,
    setError,
    reset,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
