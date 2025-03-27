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
   * Gets the full URL for an image
   * @param imageUrl The image URL from the database
   * @returns The full URL to the image
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    
    // Log the URL construction
    console.log('Constructing full image URL from:', imageUrl);
    
    // Make sure the URL starts with a slash
    if (!imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl;
    }
    
    const fullUrl = `${this.apiUrl}${imageUrl}`;
    console.log('Full constructed image URL:', fullUrl);
    
    return fullUrl;
  }

  /**
   * Gets the profile image URL for a user
   * @param imageUrl The image URL from the database
   * @returns The full URL to the profile image
   */
  getProfileImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.getDefaultAvatarPath();
    }
    return this.getImageUrl(imageUrl);
  }

  /**
   * Gets the default avatar path
   * @returns The path to the default avatar image
   */
  getDefaultAvatarPath(): string {
    return '/images/default-avatar.png';
  }

  /**
   * Uploads an image to the server
   * @param file The image file to upload
   * @returns An Observable with the upload response
   */
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/images`, formData);
  }
} 