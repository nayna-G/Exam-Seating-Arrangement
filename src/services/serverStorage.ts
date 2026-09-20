/**
 * Server Storage Service
 * Handles saving and loading seating data from server-side CSV files
 */

export interface SeatingAssignment { // Interface declaration: Defines individual seat assignment
  studentId: string; // Property: Student ID
  studentName: string; // Property: Student name
  studentExam: string; // Property: Exam subject
  date: string; // Property: Exam date
  roomNo: string; // Property: Room number
  roomName: string; // Property: Room name
  seatNo: number; // Property: Seat number
  row: number; // Property: Row number
  column: number; // Property: Column number
  roomCapacity: number; // Property: Room capacity
  roomLayout: string; // Property: Room layout string
}

export interface SeatingData { // Interface declaration: Defines server seating data response
  seatingArrangement: SeatingAssignment[]; // Property: Array of seat assignments
  totalStudents: number; // Property: Total students count
  loadedFromFile?: boolean; // Optional property: Flag indicating if loaded from file
  message?: string; // Optional property: Server message
}

const API_BASE_URL = 'http://localhost:8080/api'; // Constant declaration: Backend API base URL

export const saveSeatingToServer = async (seatingData: SeatingAssignment[]): Promise<boolean> => { // Function declaration: Saves seating data to server
  try { // Try block: Begins HTTP request
    const response = await fetch(`${API_BASE_URL}/save-seating`, { // Async function call: POST request to save endpoint
      method: 'POST', // Attribute: HTTP POST method
      headers: { // Attribute: Request headers
        'Content-Type': 'application/json', // Header: JSON content type
      },
      body: JSON.stringify({ seatingArrangement: seatingData }) // Body: Seating data as JSON string
    });

    if (!response.ok) { // Conditional check: Validates response status
      throw new Error(`HTTP error! status: ${response.status}`); // Error: Throws HTTP error
    }

    const result = await response.json(); // Async function call: Parses JSON response
    console.log('Seating data saved to server:', result); // Console log: Success message
    return result.success || false; // Return statement: Returns success flag
  } catch (error) { // Catch block: Handles request errors
    console.error('Error saving seating to server:', error); // Console error: Logs error details
    return false; // Return statement: Returns false on error
  }
};

export const loadSeatingFromServer = async (retries: number = 3): Promise<SeatingData | null> => { // Function declaration: Loads seating data with retry logic
  for (let attempt = 1; attempt <= retries; attempt++) { // For loop: Iterates through retry attempts
    let timeoutId: NodeJS.Timeout | null = null; // Variable declaration: Timeout ID for abort controller
    try { // Try block: Begins HTTP request
      console.log(`Attempting to load seating data from server (attempt ${attempt}/${retries})...`); // Console log: Attempt message
      
      const controller = new AbortController(); // Object instantiation: Creates abort controller for timeout
      timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout function: Aborts request after 10 seconds
      
      const response = await fetch(`${API_BASE_URL}/seating`, { // Async function call: GET request to seating endpoint
        method: 'GET', // Attribute: HTTP GET method
        headers: { // Attribute: Request headers
          'Content-Type': 'application/json', // Header: JSON content type
        },
        signal: controller.signal // Attribute: Abort signal for timeout
      });

      clearTimeout(timeoutId); // Timeout function: Clears timeout on success
      timeoutId = null; // Variable assignment: Resets timeout ID

      if (!response.ok) { // Conditional check: Validates response status
        throw new Error(`HTTP error! status: ${response.status}`); // Error: Throws HTTP error
      }

      const data = await response.json(); // Async function call: Parses JSON response
      console.log('Seating data loaded from server:', data); // Console log: Success message
      return data; // Return statement: Returns seating data
    } catch (error) { // Catch block: Handles request errors
      if (timeoutId) { // Conditional check: Clears timeout if set
        clearTimeout(timeoutId); // Timeout function: Clears timeout
        timeoutId = null; // Variable assignment: Resets timeout ID
      }
      
      if (error instanceof Error) { // Conditional check: Checks if error is Error instance
        if (error.name === 'AbortError') { // Conditional check: Timeout error
          console.error(`Request timeout (attempt ${attempt}/${retries}): Request took longer than 10 seconds`); // Console error: Timeout message
        } else if (error.message.includes('fetch')) { // Conditional check: Network error
          console.error(`Network error (attempt ${attempt}/${retries}):`, error.message); // Console error: Network message
        } else { // Else block: Other errors
          console.error(`Server error (attempt ${attempt}/${retries}):`, error.message); // Console error: Server message
        }
      } else { // Else block: Unknown error type
        console.error(`Unknown error (attempt ${attempt}/${retries}):`, error); // Console error: Unknown message
      }
      
      if (attempt === retries) { // Conditional check: If all retries exhausted
        console.error('All retry attempts failed. Server may be unavailable or network issues persist.'); // Console error: Failure message
        return null; // Return statement: Returns null
      }
      
      const delay = Math.pow(2, attempt) * 1000; // Variable: Calculates exponential backoff delay (2s, 4s, 8s)
      console.log(`Retrying in ${delay}ms...`); // Console log: Retry delay message
      await new Promise(resolve => setTimeout(resolve, delay)); // Async function call: Waits before retry
    }
  }
  
  return null; // Return statement: Returns null if all retries fail
};

export const searchStudentOnServer = async (studentId: string): Promise<SeatingAssignment | null> => { // Function declaration: Searches for student on server
  try { // Try block: Begins HTTP request
    const response = await fetch(`${API_BASE_URL}/student/${studentId}`, { // Async function call: GET request to student endpoint
      method: 'GET', // Attribute: HTTP GET method
      headers: { // Attribute: Request headers
        'Content-Type': 'application/json', // Header: JSON content type
      }
    });

    if (!response.ok) { // Conditional check: Validates response status
      throw new Error(`HTTP error! status: ${response.status}`); // Error: Throws HTTP error
    }

    const data = await response.json(); // Async function call: Parses JSON response
    
    if (data.found && data.student) { // Conditional check: If student found in response
      return data.student; // Return statement: Returns student data
    }
    
    return null; // Return statement: Returns null if not found
  } catch (error) { // Catch block: Handles request errors
    console.error('Error searching student on server:', error); // Console error: Logs error details
    return null; // Return statement: Returns null on error
  }
};

export const checkServerData = async (): Promise<boolean> => { // Function declaration: Checks if server has seating data
  try { // Try block: Begins data check
    const data = await loadSeatingFromServer(); // Async function call: Loads data from server
    return data !== null && data.seatingArrangement && data.seatingArrangement.length > 0; // Return statement: Returns true if data exists and has assignments
  } catch (error) { // Catch block: Handles check errors
    console.error('Error checking server data:', error); // Console error: Logs error details
    return false; // Return statement: Returns false on error
  }
};
