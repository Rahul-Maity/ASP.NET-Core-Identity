import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { AccountService } from "../../account/account.service";


@Injectable()
export class JwtInterceptor implements HttpInterceptor{
    constructor(private accountService:AccountService){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.accountService.user$.pipe(take(1)).subscribe({
            next: user => {
                if (user) {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${user.jwt}`
                        }
                    });
                }
            }
        })
        return next.handle(req);
    }

    
}