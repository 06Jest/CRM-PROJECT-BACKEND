I have already finished refactoring my backend authentication flow. Your job is to modify ONLY the frontend to match the backend.

Use my backend as the source of truth. Do NOT redesign my architecture or invent new endpoints.

Tasks:
1. Analyze my backend routes, controllers, and services.
2. Modify my frontend authService.ts to call the correct endpoints.
3. Modify my Redux userSlice.ts to match the new backend responses.
4. Remove any obsolete admin/agent authentication logic.
5. Replace separate adminSignIn/agentSignIn with a single signIn flow if the backend now uses one endpoint.
6. Update TypeScript types if the backend response has changed.
7. Keep Redux Toolkit createAsyncThunk and createSlice.
8. Preserve my coding style and naming conventions.
9. Do not change unrelated files.
10. Show every change with explanations.

While reviewing, verify the following:
- Registration flow
- Login flow
- Logout
- Refresh token
- Current user (/me)
- Change password
- Error handling
- Cookie authentication
- needsOnboarding handling

Expected frontend flow:

Register
↓
Email Verification
↓
Login
↓
Backend returns:
{
    success,
    profile,
    needsOnboarding
}
↓
Frontend:
if (needsOnboarding)
    navigate("/onboarding");
else
    navigate("/app/dashboard");

After successful login, fetch /me to populate the profile state.

Finally, list:
1. Files that need modification.
2. Exact code changes.
3. Any dead code that can now be deleted.
4. Any frontend bugs or inconsistencies you discover.

I will provide:
- auth routes
- auth controller
- auth service
- authService.ts
- userSlice.ts
- related frontend types

Treat the backend as the single source of truth.

BACKEND:

import {
  createSupabaseClient,
  createSupabaseUserClient,
} from "../config/supabase";

import type {
  SignUpDTO,
  SignInDTO,
  ChangePasswordDTO,
  RequestMeta,
  TokenPair,
} from "../types/auth";

import { AppError } from "../middleware/error.middleware";

import {
  createAccessToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "./jwt.service";

import {  getProfileIfExistFromDB } from "./profiles.service";
import { getMembershipForAuthFromDB } from "./organization.members.service";

export const signUpWithAuth = async (
  dto: SignUpDTO
) => {
  const db = createSupabaseClient();

  const { data, error } = await db.auth.signUp({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
  });

  if (error) {
    throw new AppError(
      400,
      `Failed to create account: ${error.message}`
    );
  }

  if (!data.user) {
    throw new AppError(
      500,
      "Failed to create user."
    );
  }

  return data.user;
};

export const signInWithAuth = async (
  dto: SignInDTO
) => {
  const db = createSupabaseClient();

  const { data, error } =
    await db.auth.signInWithPassword({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

  if (error) {
    throw new AppError(
      400,
      `Failed to log in: ${error.message}`
    );
  }

  return data;
};

export const newRefresh = async (
  rawRefreshToken: string,
  meta: RequestMeta
): Promise<TokenPair> => {

  const {
    newRawToken,
    profileId,
  } = await rotateRefreshToken(
    rawRefreshToken,
    meta
  );


  const profile =
    await getProfileIfExistFromDB(profileId);


  if (!profile) {
    throw new AppError(
      404,
      "Profile not found"
    );
  }


  let membership = null;


  if (profile.onboarding_completed) {

    membership =
      await getMembershipForAuthFromDB(
        profile.id
      );

    if (!membership) {
      throw new AppError(
        403,
        "Organization membership not found"
      );
    }
  }


  const accessToken =
    createAccessToken(
      profile,
      membership
    );


  return {
    accessToken,
    refreshToken: newRawToken,
  };
};

export const requestPasswordReset = async (
  email: string
): Promise<void> => {
  const db = createSupabaseClient();

  const { error } =
    await db.auth.resetPasswordForEmail(email);

  if (error) {
    throw new AppError(
      400,
      `Failed to request password reset: ${error.message}`
    );
  }
};

export const changePasswordFromAuth = async (
  user: ChangePasswordDTO,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error: verifyError } =
    await db.auth.signInWithPassword({
      email: user.email,
      password: user.current_password,
    });

  if (verifyError) {
    throw new AppError(
      401,
      "Current password is incorrect"
    );
  }

  const { error } =
    await db.auth.updateUser({
      password: user.new_password,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to update password: ${error.message}`
    );
  }

  await revokeAllForProfile(user.id);
};

export const signOutFromAuth = async (
  rawRefreshToken: string
): Promise<void> => {
  await revokeRefreshToken(rawRefreshToken);
};

export const signOutAllSessions = async (
  profileId: string
): Promise<void> => {
  await revokeAllForProfile(profileId);
};

import {
  createSupabaseClient,
  createSupabaseUserClient,
} from "../config/supabase";

import type {
  SignUpDTO,
  SignInDTO,
  ChangePasswordDTO,
  RequestMeta,
  TokenPair,
} from "../types/auth";

import { AppError } from "../middleware/error.middleware";

import {
  createAccessToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "./jwt.service";

import {  getProfileIfExistFromDB } from "./profiles.service";
import { getMembershipForAuthFromDB } from "./organization.members.service";

export const signUpWithAuth = async (
  dto: SignUpDTO
) => {
  const db = createSupabaseClient();

  const { data, error } = await db.auth.signUp({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
  });

  if (error) {
    throw new AppError(
      400,
      `Failed to create account: ${error.message}`
    );
  }

  if (!data.user) {
    throw new AppError(
      500,
      "Failed to create user."
    );
  }

  return data.user;
};

export const signInWithAuth = async (
  dto: SignInDTO
) => {
  const db = createSupabaseClient();

  const { data, error } =
    await db.auth.signInWithPassword({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

  if (error) {
    throw new AppError(
      400,
      `Failed to log in: ${error.message}`
    );
  }

  return data;
};

export const newRefresh = async (
  rawRefreshToken: string,
  meta: RequestMeta
): Promise<TokenPair> => {

  const {
    newRawToken,
    profileId,
  } = await rotateRefreshToken(
    rawRefreshToken,
    meta
  );


  const profile =
    await getProfileIfExistFromDB(profileId);


  if (!profile) {
    throw new AppError(
      404,
      "Profile not found"
    );
  }


  let membership = null;


  if (profile.onboarding_completed) {

    membership =
      await getMembershipForAuthFromDB(
        profile.id
      );

    if (!membership) {
      throw new AppError(
        403,
        "Organization membership not found"
      );
    }
  }


  const accessToken =
    createAccessToken(
      profile,
      membership
    );


  return {
    accessToken,
    refreshToken: newRawToken,
  };
};

export const requestPasswordReset = async (
  email: string
): Promise<void> => {
  const db = createSupabaseClient();

  const { error } =
    await db.auth.resetPasswordForEmail(email);

  if (error) {
    throw new AppError(
      400,
      `Failed to request password reset: ${error.message}`
    );
  }
};

export const changePasswordFromAuth = async (
  user: ChangePasswordDTO,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error: verifyError } =
    await db.auth.signInWithPassword({
      email: user.email,
      password: user.current_password,
    });

  if (verifyError) {
    throw new AppError(
      401,
      "Current password is incorrect"
    );
  }

  const { error } =
    await db.auth.updateUser({
      password: user.new_password,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to update password: ${error.message}`
    );
  }

  await revokeAllForProfile(user.id);
};

export const signOutFromAuth = async (
  rawRefreshToken: string
): Promise<void> => {
  await revokeRefreshToken(rawRefreshToken);
};

export const signOutAllSessions = async (
  profileId: string
): Promise<void> => {
  await revokeAllForProfile(profileId);
};

import { Router } from "express";

import {
  signUp,
  signIn,
  refreshToken,
  getCurrentUser,
  changePassword,
  signOut,
} from "../controllers/auth.controller";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
} from "../schema/auth.schema";

import {
  loginLimiter,
  refreshLimiter,
} from "../middleware/rate.limit.middleware";

const router = Router();

router.post(
  "/signup",
  loginLimiter,
  validateBody(signUpSchema),
  signUp
);

router.post(
  "/signin",
  loginLimiter,
  validateBody(signInSchema),
  signIn
);

router.patch(
  "/refresh",
  refreshLimiter,
  refreshToken
);

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  "/me",
  getCurrentUser
);

router.patch(
  "/me/change-password",
  validateBody(changePasswordSchema),
  changePassword
);

router.delete(
  "/signout",
  signOut
);

export default router;

import { z } from "zod";
import {
  passwordSchema,
  emailSchema,
} from "./global.schema";

export const signUpSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  current_password: passwordSchema,

  new_password: passwordSchema,
});


FRONTEND(NEEDED CHANGES):

import type { ChangePasswordDTO, SignInDTO, SignUpDTO } from "../types/auth";
import { apiClient } from "./apiClient";


export const signUpAPI = async (dto: SignUpDTO) => {
  return apiClient("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(dto),
  });
};


export const adminSignInAPI = async (dto: SignInDTO) => {
  return apiClient("/api/auth/admin-signin", {
    method: "POST",
    body: JSON.stringify(dto),
  });
};


export const agentSignInAPI = async (dto: SignInDTO) => {
  return apiClient("/api/auth/agent-signin", {
    method: "POST",
    body: JSON.stringify(dto),
  });
};


export const getCurrentUserAPI = async () => {
  return apiClient("/api/auth/me", {
    method: "GET",
  });
};


export const refreshAPI = async () => {
  return apiClient("/api/auth/refresh", {
    method: "PATCH",
  });
};


export const changePasswordAPI = async (
  dto: ChangePasswordDTO
) => {
  return apiClient("/api/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
};


export const signOutAPI = async () => {
  return apiClient("/api/auth/signout", {
    method: "DELETE",
  });
};

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adminSignInAPI, agentSignInAPI, changePasswordAPI, getCurrentUserAPI, refreshAPI, signOutAPI, signUpAPI } from '../services/authService';
import type { ChangePasswordDTO, SignInDTO, SignUpDTO, UserState } from '../types/auth';

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  loaded: false,
  error: null,
};

export const signUp = createAsyncThunk(
  "auth/signup",
  async (dto: SignUpDTO, thunkAPI) => {
    try {
      return await signUpAPI(dto);

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to sign in user"
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      return await getCurrentUserAPI();

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to get current user"
      );
    }
  }
);

export const adminSignIn = createAsyncThunk(
  "auth/admin-signin",
  async (dto: SignInDTO, thunkAPI) => {
    try {
      return await adminSignInAPI(dto);

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to sign in user"
      );
    }
  }
);

export const agentSignIn = createAsyncThunk(
  "auth/agent-signin",
  async (dto: SignInDTO, thunkAPI) => {
    try {
      return await agentSignInAPI(dto);

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to sign in user"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/change-password",
  async (dto: ChangePasswordDTO, thunkAPI) => {
    try {
      return await changePasswordAPI(dto);

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to sign in user"
      );
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signout",
  async (_, thunkAPI) => {
    try {
      return await signOutAPI();

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to sign out user"
      );
    }
  }
);

export const refresh = createAsyncThunk(
  "auth/refresh",
  async (_, thunkAPI) => {
    try {
      return await refreshAPI();

    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue(
        "Failed to refresh token"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(signUp.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })



      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.user = action.payload.profile;
        state.isAuthenticated = true;
      })

      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.loaded = true;
        state.user = null;
        state.isAuthenticated = false;
      })


      .addCase(adminSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
        
      })
      .addCase(adminSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(adminSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(agentSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(agentSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(agentSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        console.log("LOGOUT FULFILLED");
        state.loading = false;
        state.loaded = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;

      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(refresh.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refresh.fulfilled, (state) => {
        state.loading = false;
        state.loaded = true;
        state.isAuthenticated = true;

      })
      .addCase(refresh.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;

UI(ABSOLUTELY NEED CHANGES):
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, TextField, Typography,
  Paper, CircularProgress, Tabs, Tab, Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import {  useSelector } from 'react-redux';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect } from 'react';
import type { RootState } from '../../../store/store';
import ErrorAlert from '../../../components/Error';


type LoginMode = 0 | 1;


export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>(0);
  const themeMode = useSelector((state: RootState) => state.ui.themeMode);
  const [showPassword, setShowPassword] = useState(false);

  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
  });

  const [agentForm, setAgentForm] = useState({
    email: '',
    password: '',
  });

  const {
  isAuthenticated,
  loading,
  error,
  adminLogin,
  currentUser,
  agentLogin
} = useAuth();

  useEffect(() => {

  if (!loading && isAuthenticated) {
    navigate("/app/dashboard", { replace: true });
  }
}, [isAuthenticated, loading, navigate]);
  

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await adminLogin(adminForm).unwrap();
      await currentUser().unwrap();
      navigate("/app/dashboard");
    } catch {
      // Error is already stored in auth.error
    }
  };


  const handleAgentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await agentLogin(agentForm);
      await currentUser().unwrap();
      navigate("/app/dashboard");
    } catch {
        // Error is already stored in auth.error
    }
  };

  const BACKGROUNDCOLOR = themeMode === 'light' ? 'rgba(255, 255, 255, 0.73)' : 'rgba(34, 34, 34, 0.65)';

  return (
    <Box
      sx={{
        my: 5,
        mx: '5%',
        height: '70vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: '430px',
          height: '60vh',
          width: '75vw',
          maxHeight: '550px',
          minHeight: '450px',
          border: 1,
          justifySelf: 'center',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: `${BACKGROUNDCOLOR}`,
        }}
      >

        <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
          Sign in to uniThread
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          Choose your login type below
        </Typography>


        <Tabs
          value={mode}
          onChange={(_, v) => { setMode(v); }}
          variant="fullWidth"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider'}}
        >
          <Tab
            icon={<EmailIcon fontSize="small" />}
            iconPosition="start"
            label="Admin"
            sx={{ fontSize: 11 }}
          />
          <Tab
            icon={<BadgeIcon fontSize="small" />}
            iconPosition="start"
            label="Agent"
            sx={{ fontSize: 11 }}
          />
        </Tabs>
        {error && (
          <Box sx={{mb: 2}}>
            <ErrorAlert
              message={error}
            />
          </Box>
        )}
        


        {mode === 0 && (
          <Box component="form" onSubmit={handleAdminLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email address"
                type="email"
                size="small" 
                placeholder="loremipsum@gmail.com"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
                required
                fullWidth
                autoFocus
                autoComplete="email"
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                size="small" 
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, password: e.target.value })
                }
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="medium"
                disabled={loading || !adminForm.email || !adminForm.password}
              >
                {loading
                  ? <CircularProgress size={22} color="inherit" />
                  : 'Sign in as Admin'
                }
              </Button>
            </Box>
          </Box>
        )}


        {mode === 1 && (
          <Box component="form" onSubmit={handleAgentLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email address"
                value={agentForm.email}
                onChange={(e) =>
                  setAgentForm({ ...agentForm, email: e.target.value })
                }
                required
                fullWidth
                autoFocus
                size="small" 
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                size="small" 
                value={agentForm.password}
                onChange={(e) =>
                  setAgentForm({ ...agentForm, password: e.target.value })
                }
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="medium"
                disabled={loading || !agentForm.email || !agentForm.password}
              >
                {loading
                  ? <CircularProgress size={22} color="inherit" />
                  : 'Sign in as Agent'
                }
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" >
            <Link to="/register" style={{ color: 'inherit', fontWeight: 500, display: 'flex',
            justifyContent: 'space-between',
            width: '100%', }}>
              Create account
            </Link>
            
          </Typography>
          <Link
            to="/forgot-password"
            style={{ fontSize: 14, color: 'inherit' }}
          >
            Forgot password?
          </Link> 
        </Box>
      </Paper>
    </Box>
  );
}

ADDITIONAL INFORMATIONS(TYPES):

import type { DisplayProfile } from "./profile";

export interface UserState {
  user: DisplayProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}


export interface SignUpDTO {
  email: string;
  password: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}


export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
}