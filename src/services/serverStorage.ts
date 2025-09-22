/**
 * Server Storage Service
 * Handles saving and loading seating data from server-side CSV files
 */

export interface SeatingAssignment {
  studentId: string;
  studentName: string;
  studentExam: string;
  date: string;
  roomNo: string;
  roomName: string;
  seatNo: number;
  row: number;
  column: number;
  roomCapacity: number;
  roomLayout: string;
}

export interface SeatingData {
  seatingArrangement: SeatingAssignment[];
  totalStudents: number;
  loadedFromFile?: boolean;
  message?: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Save seating data to server CSV file
 */
export const saveSeatingToServer = async (seatingData: SeatingAssignment[]): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-seating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seatingArrangement: seatingData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Seating data saved to server:', result);
    return result.success || false;
  } catch (error) {
    console.error('Error saving seating to server:', error);
    return false;
  }
};

/**
 * Load seating data from server CSV file with retry logic
 */
export const loadSeatingFromServer = async (retries: number = 3): Promise<SeatingData | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      console.log(`Attempting to load seating data from server (attempt ${attempt}/${retries})...`);
      
      // Create AbortController for timeout (more compatible than AbortSignal.timeout)
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/seating`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if request succeeds
      timeoutId = null;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Seating data loaded from server:', data);
      return data;
    } catch (error) {
      // Clear timeout in case of error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Better error logging with error type detection
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`Request timeout (attempt ${attempt}/${retries}): Request took longer than 10 seconds`);
        } else if (error.message.includes('fetch')) {
          console.error(`Network error (attempt ${attempt}/${retries}):`, error.message);
        } else {
          console.error(`Server error (attempt ${attempt}/${retries}):`, error.message);
        }
      } else {
        console.error(`Unknown error (attempt ${attempt}/${retries}):`, error);
      }
      
      if (attempt === retries) {
        console.error('All retry attempts failed. Server may be unavailable or network issues persist.');
        return null;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
};

/**
 * Search for a student in server data
 */
export const searchStudentOnServer = async (studentId: string): Promise<SeatingAssignment | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.found && data.student) {
      return data.student;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching student on server:', error);
    return null;
  }
};

/**
 * Check if server has seating data
 */
export const checkServerData = async (): Promise<boolean> => {
  try {
    const data = await loadSeatingFromServer();
    return data !== null && data.seatingArrangement && data.seatingArrangement.length > 0;
  } catch (error) {
    console.error('Error checking server data:', error);
    return false;
  }
};
