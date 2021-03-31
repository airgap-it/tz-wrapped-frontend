import { Injectable, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'shorten',
})
@Injectable({
  providedIn: 'root',
})
export class ShortenPipe implements PipeTransform {
  public transform(value: string, args: { ifMatches?: string | RegExp } = {}) {
    if (!value || !(typeof value === 'string')) {
      return ''
    }

    let result = value
    if (
      value.length >= 12 &&
      (args.ifMatches === undefined || result.match(args.ifMatches))
    ) {
      result = `${value.substr(0, 5)}...${value.substr(-5)}`
    }

    return result
  }
}
