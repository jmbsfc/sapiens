import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = "http://localhost:8080";
  private defaultAvatarPath = 'assets/images/default-avatar.svg';

  constructor(private http: HttpClient) { }

  /**
   * Uploads an image to the server
   * @param imageFile The image file to upload
   * @returns An Observable with the response containing the image filename
   */
  uploadImage(imageFile: File): Observable<{data: string}> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.http.post<{data: string}>(`${this.apiUrl}/images`, formData);
  }

  /**
   * Gets the full URL for an image
   * @param filename The image filename or path
   * @returns The full URL to the image
   */
  getImageUrl(filename: string): string {
    console.log('ImageService.getImageUrl called with:', filename);
    
    // Return default avatar if no filename or 'n'
    if (!filename || filename === 'n') {
      console.log('No filename or "n" provided, returning default avatar');
      return this.defaultAvatarPath;
    }
    
    // Handle full URLs (in case the backend returns a complete URL)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      console.log('Full URL detected, returning as is:', filename);
      return filename;
    }
    
    // Extract the filename from the path
    let extractedFilename = filename;
    
    // If the path starts with '/images/', extract just the filename
    if (filename.startsWith('/images/')) {
      extractedFilename = filename.substring('/images/'.length);
      console.log('Extracted filename from /images/ path:', extractedFilename);
    } 
    // If the path starts with a slash but not '/images/'
    else if (filename.startsWith('/') && !filename.startsWith('/images/')) {
      // Remove the leading slash
      extractedFilename = filename.substring(1);
      console.log('Removed leading slash from path:', extractedFilename);
    }
    
    // Construct the full URL to the image
    const fullUrl = `${this.apiUrl}/images/${extractedFilename}`;
    console.log('Final image URL:', fullUrl);
    return fullUrl;
  }

  /**
   * Checks if an image exists at the given URL
   * @param url The URL to check
   * @returns An Observable that resolves to true if the image exists, false otherwise
   */
  checkImageExists(url: string): Observable<boolean> {
    return this.http.head(url, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(() => of(false))
      );
  }
  
  /**
   * Gets the profile image URL for a user
   * This is a helper method that handles all the common cases for profile images
   * @param imageUrl The image URL from the user profile
   * @returns The full URL to the profile image, or the default avatar if the image doesn't exist
   */
  getProfileImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return this.defaultAvatarPath;
    }
    
    // Try to get the image URL using the standard method
    return this.getImageUrl(imageUrl);
  }
  
  /**
   * Gets the default avatar path
   * @returns The path to the default avatar
   */
  getDefaultAvatarPath(): string {
    return this.defaultAvatarPath;
  }
  
  /**
   * Validates an image URL by checking if it exists
   * If the image doesn't exist, returns the default avatar path
   * @param imageUrl The image URL to validate
   * @returns An Observable that resolves to the validated image URL
   */
  validateImageUrl(imageUrl: string): Observable<string> {
    if (!imageUrl || imageUrl === 'n') {
      return of(this.defaultAvatarPath);
    }
    
    const fullUrl = this.getImageUrl(imageUrl);
    
    return this.checkImageExists(fullUrl).pipe(
      map(exists => {
        if (exists) {
          return fullUrl;
        } else {
          console.warn(`Image does not exist at ${fullUrl}, using default avatar`);
          return this.defaultAvatarPath;
        }
      }),
      catchError(() => {
        console.error(`Error checking if image exists at ${fullUrl}, using default avatar`);
        return of(this.defaultAvatarPath);
      })
    );
  }
} 