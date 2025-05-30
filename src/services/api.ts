import { API_ENDPOINT } from '../constants';
import { ApiResponse } from '../types/types';

/**
 * Fetches an AI response from the backend API.
 * @param question The question to send to the AI.
 * @param apiKey The API key for authentication.
 * @returns A promise that resolves to the ApiResponse.
 * @throws An error if the API request fails.
 */
export const fetchAiResponse = async (
  question: string,
  apiKey: string
): Promise<ApiResponse> => {
  const response = await fetch(`${API_ENDPOINT}/api/v1/ai/question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    // Attempt to parse error details from the response body
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing JSON fails, use the status text
      throw new Error(response.statusText || 'An API error occurred');
    }
    // Throw an error with details from the API or a generic message
    throw new Error(errorData?.detail || response.statusText || 'An API error occurred');
  }

  return response.json() as Promise<ApiResponse>;
};
