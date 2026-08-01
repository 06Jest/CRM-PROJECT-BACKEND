import { apiClient } from "./apiClient";

import type {
  DashboardOverview,
  LeadMetrics,
  DealMetrics,
  CustomerMetrics,
  ActivityMetrics,
  DashboardTrends,
  ActivityItem,
  UserPerformanceMetrics,
  TrendInterval,
} from "../types/dashboard";

export const fetchDashboardOverviewAPI =
  async (): Promise<DashboardOverview> => {

    const result = await apiClient(
      "/api/dashboard/overview",
      {
        method: "GET",
      }
    );

    return result.data as DashboardOverview;

  };

export const fetchLeadMetricsAPI =
  async (): Promise<LeadMetrics> => {

    const result = await apiClient(
      "/api/dashboard/lead-metrics",
      {
        method: "GET",
      }
    );

    return result.data as LeadMetrics;

  };

export const fetchDealMetricsAPI =
  async (): Promise<DealMetrics> => {

    const result = await apiClient(
      "/api/dashboard/deal-metrics",
      {
        method: "GET",
      }
    );

    return result.data as DealMetrics;

  };

export const fetchCustomerMetricsAPI =
  async (): Promise<CustomerMetrics> => {

    const result = await apiClient(
      "/api/dashboard/customer-metrics",
      {
        method: "GET",
      }
    );

    return result.data as CustomerMetrics;

  };

export const fetchActivityMetricsAPI =
  async (): Promise<ActivityMetrics> => {

    const result = await apiClient(
      "/api/dashboard/activity-metrics",
      {
        method: "GET",
      }
    );

    return result.data as ActivityMetrics;

  };

export const fetchDashboardTrendsAPI =
  async (
    interval: TrendInterval = "day",
    daysBack = 30
  ): Promise<DashboardTrends> => {

    const result = await apiClient(
      `/api/dashboard/trends?interval=${interval}&daysBack=${daysBack}`,
      {
        method: "GET",
      }
    );

    return result.data as DashboardTrends;

  };

export const fetchRecentDashboardActivitiesAPI =
  async (
    limit = 10
  ): Promise<ActivityItem[]> => {

    const result = await apiClient(
      `/api/dashboard/recent-activities?limit=${limit}`,
      {
        method: "GET",
      }
    );

    return result.data as ActivityItem[];

  };

export const fetchUserPerformanceMetricsAPI =
  async (): Promise<UserPerformanceMetrics> => {

    const result = await apiClient(
      "/api/dashboard/user-performance",
      {
        method: "GET",
      }
    );

    return result.data as UserPerformanceMetrics;

  }; 


export interface DashboardState {
  overview: DashboardOverview | null;
  leadMetrics: LeadMetrics | null;
  dealMetrics: DealMetrics | null;
  customerMetrics: CustomerMetrics | null;
  activityMetrics: ActivityMetrics | null;
  trends: DashboardTrends | null;
  recentActivities: ActivityItem[];
  userPerformance: UserPerformanceMetrics | null;

  loading: {
    overview: boolean;
    leads: boolean;
    deals: boolean;
    customers: boolean;
    activity: boolean;
    trends: boolean;
    recentActivities: boolean;
    performance: boolean;
  };
  loaded: boolean;
  error: string | null;
}

export interface DashboardParams {
  orgId: string;
  accessToken: string;
}

export type TrendInterval =
  | 'day'
  | 'week'
  | 'month';

export interface TrendParams extends DashboardParams {
  interval?: TrendInterval;
  daysBack?: number;
}

export interface RecentActivityParams
  extends DashboardParams {
  limit?: number;
}

export interface DashboardOverview {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  totalCustomers: number;
  totalEmails: number;
  totalSms: number;
  totalCalls: number;
  totalTasks: number;
}

export interface LeadMetrics {
  totalLeads: number;
  leadsBySource: Record<string, number>;
  leadsByPriority: Record<string, number>;
  leadsByStatus: Record<string, number>;
  conversionRate: number;
}

export interface DealMetrics {
  totalDeals: number;
  dealsByStage: Record<string, number>;
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
  totalRevenue: number;
  averageDealSize: number;
  winRate: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  customersByStatus: Record<string, number>;
  activeCustomers: number;
  churnedCustomers: number;
  customerGrowth: Record<string, number>;
}

export interface ActivityMetrics {
  emailsSent: number;
  smsSent: number;
  callsCompleted: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
}

export interface DashboardTrends {
  interval: TrendInterval;
  startDate: string;
  leadsCreated: Record<string, number>;
  dealsCreated: Record<string, number>;
  revenueOverTime: Record<string, number>;
  customerGrowth: Record<string, number>;
}

export type ActivityType =
  | 'lead'
  | 'deal'
  | 'customer'
  | 'email'
  | 'sms'
  | 'call'
  | 'task';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  createdAt: string;
}

export interface UserPerformanceMetrics {
  leadsPerUser: Record<string, number>;
  dealsClosedPerUser: Record<string, number>;
  tasksCompletedPerUser: Record<string, number>;
  callsCompletedPerUser: Record<string, number>;
}


// This is Dashboard controller
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";

import {
  getDashboardOverviewFromDB,
  getLeadMetricsFromDB,
  getDealMetricsFromDB,
  getCustomerMetricsFromDB,
  getActivityMetricsFromDB,
  getDashboardTrendsFromDB,
  getRecentDashboardActivitiesFromDB,
  getUserPerformanceMetricsFromDB,
} from "../services/dashboard.service";

import type { TrendInterval } from "../types/dashboard";

const ALLOWED_TREND_INTERVALS: TrendInterval[] = ["day", "week", "month"];

export const getDashboardOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const overview = await getDashboardOverviewFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard overview fetch successful",
      data: overview,
    });

  } catch (err) {
    next(err);
  }
};

export const getLeadMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const leadMetrics = await getLeadMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Lead metrics fetch successful",
      data: leadMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getDealMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const dealMetrics = await getDealMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deal metrics fetch successful",
      data: dealMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getCustomerMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const customerMetrics = await getCustomerMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customer metrics fetch successful",
      data: customerMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getActivityMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const activityMetrics = await getActivityMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Activity metrics fetch successful",
      data: activityMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getDashboardTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const intervalQuery = req.query.interval;

    const interval: TrendInterval =
      typeof intervalQuery === "string" &&
      ALLOWED_TREND_INTERVALS.includes(intervalQuery as TrendInterval)
        ? (intervalQuery as TrendInterval)
        : "day";

    const daysBackQuery = req.query.daysBack;

    const daysBack =
      daysBackQuery !== undefined
        ? Number(daysBackQuery)
        : 30;

    if (!Number.isFinite(daysBack) || daysBack <= 0) {
      throw new AppError(400, "Invalid daysBack query parameter");
    }

    const trends = await getDashboardTrendsFromDB(
      orgId,
      accessToken,
      interval,
      daysBack
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard trends fetch successful",
      data: trends,
    });

  } catch (err) {
    next(err);
  }
};

export const getRecentDashboardActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const limitQuery = req.query.limit;

    const limit =
      limitQuery !== undefined
        ? Number(limitQuery)
        : 10;

    if (!Number.isFinite(limit) || limit <= 0) {
      throw new AppError(400, "Invalid limit query parameter");
    }

    const activities = await getRecentDashboardActivitiesFromDB(
      orgId,
      accessToken,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Recent dashboard activities fetch successful",
      data: activities,
    });

  } catch (err) {
    next(err);
  }
};

export const getUserPerformanceMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const performanceMetrics = await getUserPerformanceMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "User performance metrics fetch successful",
      data: performanceMetrics,
    });

  } catch (err) {
    next(err);
  }
};

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type {
  AddNote,
  NotesState,
  UpdateNote,
} from "../types/notes";

import {
  addNoteAPI,
  updateNoteAPI,
  deletePrivateNoteAPI,
  deleteNoteAPI,
  fetchNotesAPI,
  pinNoteAPI,
} from "../services/notesServices";

const initialState: NotesState = {
  items: [],
  loading: false,
  loaded: false,
  error: null,
};

export const fetchNotes = createAsyncThunk(
  "notes/show-notes",
  async (_, thunkAPI) => {
    try {
      return await fetchNotesAPI();
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to fetch notes"
      );
    }
  }
);

export const addNote = createAsyncThunk(
  "notes/add-note",
  async (note: AddNote, thunkAPI) => {
    try {
      return await addNoteAPI(note);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Something went wrong"
      );
    }
  }
);

export const updateNote = createAsyncThunk(
  "notes/update-note",
  async (
    {
      id,
      note,
    }: {
      id: string;
      note: UpdateNote;
    },
    thunkAPI
  ) => {
    try {
      return await updateNoteAPI(id, note);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Something went wrong"
      );
    }
  }
);

export const pinNote = createAsyncThunk(
  "notes/pin-note",
  async (
    {
      id,
      pinned,
    }: {
      id: string;
      pinned: boolean;
    },
    thunkAPI
  ) => {
    try {
      return await pinNoteAPI(id, pinned);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Something went wrong"
      );
    }
  }
);

export const deletePrivateNote = createAsyncThunk(
  "notes/delete-private-note",
  async (id: string, thunkAPI) => {
    try {
      return await deletePrivateNoteAPI(id);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Something went wrong"
      );
    }
  }
);

export const deleteNote = createAsyncThunk(
  "notes/delete-note",
  async (id: string, thunkAPI) => {
    try {
      return await deleteNoteAPI(id);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Something went wrong"
      );
    }
  }
);

const notesSlice = createSlice({
  name: "notes",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.loading = false;
      state.loaded = true;
      state.items = action.payload;
    });

    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(addNote.pending, (state) => {
      state.error = null;
    });

    builder.addCase(addNote.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.loading = false;
    });

    builder.addCase(addNote.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading = false;
    });

    builder.addCase(updateNote.pending, (state) => {
      state.error = null;
    });

    builder.addCase(updateNote.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (n) => n.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
        state.loading = false;
      }
    });

    builder.addCase(updateNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(pinNote.pending, (state) => {
      state.error = null;
      state.loading = true;
    });

    builder.addCase(pinNote.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (n) => n.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
        state.loading = false;
      }
    });

    builder.addCase(pinNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });


    builder.addCase(deletePrivateNote.pending, (state) => {
      state.error = null;
      state.loading = true;
    });

    builder.addCase(deletePrivateNote.fulfilled, (state, action) => {
      state.items = state.items.filter(
        (n) => n.id !== action.payload
      );
      state.loading = false;
    });

    builder.addCase(deletePrivateNote.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading = false;
    });

    builder.addCase(deleteNote.pending, (state) => {
      state.error = null;
      state.loading = true;
    });

    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.items = state.items.filter(
        (n) => n.id !== action.payload
      );
      state.loading = false;
    });

    builder.addCase(deleteNote.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading = false;
    });
    
  },
});

export const { clearError } = notesSlice.actions;

export default notesSlice.reducer;