import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = "http://localhost:8080";

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
      return 'assets/images/default-avatar.svg';
    }
    
    // Handle full URLs (in case the backend returns a complete URL)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      console.log('Full URL detected, returning as is:', filename);
      return filename;
    }
    
    // Check if the filename already starts with '/images/'
    if (filename.startsWith('/images/')) {
      const fullUrl = `${this.apiUrl}${filename}`;
      console.log('Path starts with /images/, returning:', fullUrl);
      return fullUrl;
    }
    
    // Otherwise, assume it's just a filename and construct the full path
    const fullUrl = `${this.apiUrl}/images/${filename}`;
    console.log('Treating as filename, returning:', fullUrl);
    return fullUrl;
  }
} 