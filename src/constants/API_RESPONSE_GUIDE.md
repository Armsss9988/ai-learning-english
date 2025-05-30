# API Response System Guide

## Overview

This guide explains how to use the standardized API response system implemented in this project. All API responses follow a consistent format: `{status, message, code, data}`.

## API Response Format

```typescript
interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'failed' | 'warning';
  message: string;
  code: number;
  data?: T;
  errors?: string[];
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

## Usage Examples

### 1. Creating API Routes

```typescript
// src/app/api/example/route.ts
import { ApiSuccess, ApiError, apiHandler, validateRequired } from '@/utils/apiResponse';
import { API_MESSAGE } from '@/constants/apiCode';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    const validationErrors = validateRequired({ name, email });
    if (validationErrors.length > 0) {
      return ApiError.validation(API_MESSAGE.VALIDATION_ERROR, validationErrors);
    }

    // Business logic here...
    const result = { id: 1, name, email };

    return ApiSuccess.created(result, 'User created successfully');
  });
}
```

### 2. Handling Responses in Client

#### Using useAuth Hook (Updated)
```typescript
const { login } = useAuth();

try {
  const result = await login({ email, password });
  // result.data contains the response data
  console.log('User:', result.data.user);
} catch (error) {
  // Error handling is automatic via axios interceptor
}
```

#### Using useApiResponse Hook
```typescript
import { useApiResponse } from '@/hooks/useApiResponse';
import api from '@/lib/axios';

function MyComponent() {
  const { data, loading, error, execute } = useApiResponse({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  const handleSubmit = async (formData) => {
    const result = await execute(() => api.post('/api/example', formData));
    if (result) {
      // Success - data is automatically extracted
      console.log('Created:', result);
    }
  };

  // ...
}
```

#### Using useApiPagination Hook
```typescript
import { useApiPagination } from '@/hooks/useApiResponse';

function ListComponent() {
  const { data, loading, pagination, execute } = useApiPagination();

  const loadData = async (page = 1, limit = 10) => {
    await execute(() => api.get(`/api/items?page=${page}&limit=${limit}`));
  };

  // data contains the array of items
  // pagination contains { page, limit, total, totalPages }
}
```

## Available API Response Helpers

### Success Responses
- `ApiSuccess.ok(data, message)` - 200 OK
- `ApiSuccess.created(data, message)` - 201 Created
- `ApiSuccess.noContent(message)` - 204 No Content
- `ApiSuccess.login(data, message)` - Login success
- `ApiSuccess.register(data, message)` - Registration success
- `ApiSuccess.withPagination(data, pagination, message)` - With pagination

### Error Responses
- `ApiError.badRequest(message, errors)` - 400 Bad Request
- `ApiError.unauthorized(message)` - 401 Unauthorized
- `ApiError.forbidden(message)` - 403 Forbidden
- `ApiError.notFound(message)` - 404 Not Found
- `ApiError.validation(message, errors)` - 422 Validation Error
- `ApiError.internal(message, error)` - 500 Internal Server Error

### Authentication Specific Errors
- `ApiError.invalidCredentials(message)` - Invalid login
- `ApiError.emailExists(message)` - Email already exists
- `ApiError.userNotFound(message)` - User not found
- `ApiError.tokenExpired(message)` - Token expired
- `ApiError.invalidToken(message)` - Invalid token

## Constants and Codes

### Status Types
```typescript
const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILED: 'failed',
  WARNING: 'warning'
};
```

### Response Codes
```typescript
const API_CODE = {
  // HTTP Status codes
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,

  // Custom business logic codes
  EMAIL_ALREADY_EXISTS: 1001,
  INVALID_CREDENTIALS: 1002,
  TOKEN_EXPIRED: 1003,
  // ... more codes
};
```

## Validation Helper

```typescript
import { validateRequired } from '@/utils/apiResponse';

const validationErrors = validateRequired({ 
  email: formData.email,
  password: formData.password,
  name: formData.name 
});

if (validationErrors.length > 0) {
  return ApiError.validation('Validation failed', validationErrors);
}
```

## Pagination Helper

```typescript
import { createPagination } from '@/utils/apiResponse';

const pagination = createPagination(page, limit, totalCount);
return ApiSuccess.withPagination(data, pagination);
```

## Error Handling

The axios interceptor automatically handles:
- Response format standardization
- Token expiration redirects
- Enhanced error objects with API response data

Client-side error handling:
```typescript
try {
  const response = await api.post('/api/example', data);
  // Handle success
} catch (error) {
  if (error.apiResponse) {
    // Standardized API error
    console.log('Error message:', error.apiResponse.message);
    console.log('Error code:', error.apiResponse.code);
    console.log('Validation errors:', error.apiResponse.errors);
  }
}
```

## Best Practices

1. **Always use `apiHandler`** for API routes to ensure consistent error handling
2. **Use validation helpers** for consistent input validation
3. **Prefer specific error responses** over generic ones
4. **Include helpful error messages and codes** for debugging
5. **Use the `useApiResponse` hook** for consistent client-side handling
6. **Always validate required fields** before processing
7. **Use pagination** for list endpoints with large datasets

## Migration Guide

To migrate existing API routes:

1. Import the new utilities:
   ```typescript
   import { ApiSuccess, ApiError, apiHandler } from '@/utils/apiResponse';
   ```

2. Wrap your route handler with `apiHandler`:
   ```typescript
   export async function POST(request: Request) {
     return apiHandler(async () => {
       // Your existing logic here
       return ApiSuccess.ok(data);
     });
   }
   ```

3. Replace response returns:
   ```typescript
   // Old way
   return NextResponse.json({ error: 'Not found' }, { status: 404 });
   
   // New way
   return ApiError.notFound('Resource not found');
   ```

4. Update client-side error handling to use the new format. 