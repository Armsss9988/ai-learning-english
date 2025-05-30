import { NextRequest } from "next/server";
import {
  ApiSuccess,
  ApiError,
  apiHandler,
  validateRequired,
  createPagination,
} from "@/utils/apiResponse";
import { API_MESSAGE } from "@/constants/apiCode";

// Example GET endpoint with pagination
export async function GET(request: NextRequest) {
  return apiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return ApiError.badRequest("Invalid pagination parameters", [
        "Page must be >= 1",
        "Limit must be between 1 and 100",
      ]);
    }

    // Mock data for demonstration
    const mockData = [
      { id: 1, name: "Example 1", description: "This is example 1" },
      { id: 2, name: "Example 2", description: "This is example 2" },
      { id: 3, name: "Example 3", description: "This is example 3" },
      // Add more mock data...
    ];

    // Filter data based on search
    const filteredData = search
      ? mockData.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        )
      : mockData;

    // Calculate pagination
    const total = filteredData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const pagination = createPagination(page, limit, total);

    return ApiSuccess.withPagination(
      paginatedData,
      pagination,
      "Data retrieved successfully"
    );
  });
}

// Example POST endpoint
export async function POST(request: NextRequest) {
  return apiHandler(async () => {
    const body = await request.json();
    const { name, description, category } = body;

    // Validate required fields
    const validationErrors = validateRequired({ name, description });
    if (validationErrors.length > 0) {
      return ApiError.validation(
        API_MESSAGE.VALIDATION_ERROR,
        validationErrors
      );
    }

    // Additional validation
    if (name.length < 3) {
      return ApiError.validation("Name too short", [
        "Name must be at least 3 characters",
      ]);
    }

    if (description.length < 10) {
      return ApiError.validation("Description too short", [
        "Description must be at least 10 characters",
      ]);
    }

    // Mock creation logic
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      category: category || "general",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ApiSuccess.created(newItem, "Item created successfully");
  });
}

// Example PUT endpoint
export async function PUT(request: NextRequest) {
  return apiHandler(async () => {
    const body = await request.json();
    const { id, name, description } = body;

    // Validate required fields
    const validationErrors = validateRequired({ id, name, description });
    if (validationErrors.length > 0) {
      return ApiError.validation(
        API_MESSAGE.VALIDATION_ERROR,
        validationErrors
      );
    }

    // Mock item lookup
    const existingItem = {
      id,
      name: "Old Name",
      description: "Old Description",
    };
    if (!existingItem) {
      return ApiError.notFound("Item not found");
    }

    // Mock update logic
    const updatedItem = {
      ...existingItem,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    return ApiSuccess.ok(updatedItem, API_MESSAGE.UPDATED);
  });
}

// Example DELETE endpoint
export async function DELETE(request: NextRequest) {
  return apiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return ApiError.badRequest("ID is required");
    }

    // Mock item lookup
    const existingItem = { id, name: "Item Name" };
    if (!existingItem) {
      return ApiError.notFound("Item not found");
    }

    // Mock deletion logic
    // await deleteItem(id);

    return ApiSuccess.ok(null, API_MESSAGE.DELETED);
  });
}
