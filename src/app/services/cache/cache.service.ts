import { Injectable } from '@angular/core'
import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable, of } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(private readonly storage: StorageMap) {}

  delete(key: string): Observable<undefined> {
    return this.storage.delete(key)
  }

  clear(): Observable<undefined> {
    return this.storage.clear()
  }

  set<T>(key: string, value: T): Observable<undefined> {
    return this.storage.set(key, value)
  }

  get<T>(key: string): Observable<T> {
    return <Observable<T>>this.storage.get(key)
  }
}
