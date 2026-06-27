import axios, { AxiosError, AxiosInstance } from 'axios';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${RAW_BASE_URL}/api`;
const TOKEN_KEY = 'st_token';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface DataStatus {
  has_data: boolean;
  rows: number;
}

export interface PredictionData {
  data: string;
  fluxo_previsto: number;
  saldo_previsto: number;
}

export interface ProcessedData {
  data: string;
  entrada: number;
  saida: number;
  fluxo_diario: number;
  saldo: number;
  categoria?: string;
  descricao?: string;
  ano: number;
  mes: number;
  dia: number;
}

export interface StatisticsData {
  ultimo_saldo: number;
  total_entradas: number;
  total_saidas: number;
  media_saida?: number;
  media_entrada?: number;
  data_atualizacao?: string;
}

export interface ScenarioSimulationRequest {
  variacao_entrada: number;
  variacao_saida: number;
  dias_simulacao: number;
  num_simulacoes: number;
  saldo_inicial_simulacao?: number;
}

export interface ScenarioResponse {
  results_summary: {
    prob_saldo_negativo_final: number;
    prob_saldo_negativo_qualquer_momento: number;
    dia_maior_prob_negativo: string;
    valor_maior_prob_negativo: number;
    valor_minimo_esperado: number;
    valor_maximo_esperado: number;
    valor_mediano_esperado: number;
  };
}

export interface BusinessEvent {
  name: string;
  total_amount: number;
  frequency: number;
  category: string;
}

export interface KeyBusinessEventsResponse {
  key_inflows: BusinessEvent[];
  key_outflows: BusinessEvent[];
}

export interface EventModifier {
  name: string;
  value_change_percentage: number;
  delay_days: number;
}

export interface BusinessEventSimulationRequest {
  simulation_type: 'event';
  inflow_modifiers: EventModifier[];
  outflow_modifiers: EventModifier[];
}

export interface LoanSuggestion {
  title: string;
  description: string;
  suggested_amount: number;
  common_term_months: number;
  estimated_installment: number;
}

export interface LoanSuggestionsResponse {
  sos_loan: LoanSuggestion;
  strategic_loan: LoanSuggestion;
}

export interface LoanSimulationRequest {
  simulation_type: 'loan_impact';
  loan_params: {
    amount: number;
    interest_rate_monthly: number;
    term_months: number;
  };
}

let authToken: string | null = localStorage.getItem(TOKEN_KEY);

function createAxiosClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: { Accept: 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        authToken = null;
        localStorage.removeItem(TOKEN_KEY);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

const http = createAxiosClient();

class ApiService {
  getToken(): string | null {
    return authToken;
  }

  setToken(token: string | null): void {
    authToken = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private extractErrorMessage(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const detail =
        (error.response?.data as { detail?: string; message?: string })?.detail ||
        (error.response?.data as { message?: string })?.message;
      const message = detail || `HTTP ${status}: ${statusText}`;
      const err = new Error(message) as Error & { status?: number };
      err.status = status;
      throw err;
    }
    throw error as Error;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(`${RAW_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(`${RAW_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getMe(): Promise<AuthUser> {
    try {
      const { data } = await axios.get<AuthUser>(`${RAW_BASE_URL}/api/auth/me`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getDataStatus(): Promise<DataStatus> {
    try {
      const { data } = await http.get<DataStatus>('/data/status');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async uploadExcelBundle(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await http.post<{ message: string }>(
        '/data/upload_excel_bundle',
        formData,
        { headers: { 'Content-Type': undefined as unknown as string } },
      );
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async uploadExcelBundleMulti(
    files: File[],
    hasOutflow = false,
  ): Promise<{ message: string }> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    formData.append('has_outflow', String(Boolean(hasOutflow)));
    if (files.length === 0) {
      throw new Error('No files selected.');
    }
    try {
      const { data } = await http.post<{ message: string }>(
        '/data/upload_excel_bundle',
        formData,
        { headers: { 'Content-Type': undefined as unknown as string } },
      );
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getStatistics(): Promise<StatisticsData> {
    try {
      const { data } = await http.get<StatisticsData>('/data/statistics');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async viewProcessed(params?: {
    limit?: number;
    start_date?: string;
    end_date?: string;
    order?: 'asc' | 'desc';
  }): Promise<ProcessedData[]> {
    try {
      const { data } = await http.get<ProcessedData[]>('/data/view_processed', { params });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getMonthlySummary(): Promise<
    Array<{
      ano_mes: string;
      entrada: number;
      saida: number;
      qtd_entradas_pos: number;
      qtd_saidas_pos: number;
    }>
  > {
    try {
      const { data } = await http.get('/data/monthly_summary');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getBalanceEvolution(): Promise<Array<{ data: string; saldo: number }>> {
    try {
      const { data } = await http.get('/data/balance_evolution');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getBalanceEvolutionSimple(): Promise<Array<{ data: string; saldo: number }>> {
    try {
      const { data } = await http.get('/data/balance_evolution_simple');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getYearlyMonthlyData(): Promise<
    Array<{
      ano: number;
      mes: number;
      mes_ano: string;
      total_entradas: number;
      total_saidas: number;
      fluxo_liquido: number;
      saldo_final_mes: number;
    }>
  > {
    try {
      const { data } = await http.get('/data/yearly_monthly_data');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async predictCashflow(params: { future_days: number }): Promise<PredictionData[]> {
    try {
      const { data } = await http.post<PredictionData[]>('/predictions/cashflow', params, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getFeatureImportance(): Promise<Array<{ feature: string; importance: number }>> {
    try {
      const { data } = await http.get<Array<{ feature: string; importance: number }>>(
        '/predictions/cashflow/feature_importance',
      );
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async scenarioSimulation(
    variacaoEntradas: number,
    variacaoSaidas: number,
    diasSimulacao = 30,
    numSimulacoes = 1000,
    useAiCorrelation = false,
  ): Promise<ScenarioResponse> {
    const params: ScenarioSimulationRequest = {
      variacao_entrada: variacaoEntradas / 100,
      variacao_saida: variacaoSaidas / 100,
      dias_simulacao: diasSimulacao,
      num_simulacoes: numSimulacoes,
    };
    try {
      const payload = {
        ...params,
        saldo_inicial_simulacao: undefined,
        use_ai_correlation: useAiCorrelation,
      };
      const { data } = await http.post<ScenarioResponse>('/simulations/scenarios', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async runScenarioSimulation(payload: unknown): Promise<unknown> {
    try {
      const { data } = await http.post('/simulations/scenario-simulation', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getKeyBusinessEvents(): Promise<KeyBusinessEventsResponse> {
    try {
      const { data } = await http.get<KeyBusinessEventsResponse>(
        '/simulations/key-business-events',
      );
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async getLoanSuggestions(): Promise<LoanSuggestionsResponse> {
    try {
      const { data } = await http.get<LoanSuggestionsResponse>('/simulations/loan-suggestions');
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async simulateBusinessEvents(request: BusinessEventSimulationRequest): Promise<unknown> {
    try {
      const { data } = await http.post('/simulations/scenario-simulation', request, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async simulateLoanImpact(request: LoanSimulationRequest): Promise<unknown> {
    try {
      const { data } = await http.post('/simulations/scenario-simulation', request, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const { data } = await axios.get<{ status: string }>(`${RAW_BASE_URL}/health`);
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }

  async generateReport(payload: {
    page: string;
    context?: Record<string, unknown>;
    simulation_type?: string;
  }): Promise<{
    page: string;
    model: string;
    used_ai: boolean;
    report_markdown: string;
  }> {
    try {
      const { data } = await http.post('/reports/generate', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return data;
    } catch (error) {
      this.extractErrorMessage(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;

export const predictCashflow = (params: { future_days: number }) =>
  apiService.predictCashflow(params);

export const uploadExcelBundle = (file: File) => apiService.uploadExcelBundle(file);

export const viewProcessed = (params?: {
  limit?: number;
  start_date?: string;
  end_date?: string;
  order?: 'asc' | 'desc';
}) => apiService.viewProcessed(params);

export { RAW_BASE_URL as API_BASE_URL };
