import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { NasaInterface } from "../interfaces/nasa.interface";
import { DateInterface } from "../interfaces/date.interface";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class NasaSearchService implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  chosenDate?: DateInterface;
  currentRoute?: string;
  result: NasaInterface[] = [];
  datePickerStatus: boolean = false;
  private datePickerSource$ = new BehaviorSubject<boolean>(this.datePickerStatus);
  loadingStatus$ = new BehaviorSubject<boolean>(false);
  mediaSource$ = new BehaviorSubject<any>([]);
  dataPickerCurrentVal = this.datePickerSource$.asObservable();
  randomSet$ = new BehaviorSubject<any>([]);

  constructor(private _http: HttpClient, private _router: Router) {}

  private localUrl = "https://api.nasa.gov/planetary/apod?api_key=lNDAlgsfTbQIuCybMOJaKKKdz5tEg1XYem5fydJm";

  fetchData(year: number, month: number, day: number): Observable<any> {
    this.loadingStatus$.next(true);
    const date = `${year}-${month + 1}-${day}`;
    return this._http.get(`${this.localUrl}&date=${date}`).pipe(
      map((res: any) => {
        this.mediaSource$.next(res);
        this.loadingStatus$.next(false);
        return res;
      })
    );
  }

  fetchRandomData(): Observable<any> {
    return this._http.get(`${this.localUrl}&count=10`).pipe(
      map((res: any) => {
        this.checkForVideo(res);
        return res;
      })
    );
  }

  checkForVideo(res: any) {
    let index: number = 0;
    for (let i of res) {
      index++;
      if (i.media_type === "video" || i.media_type === "other") {
        res.splice(index - 1, 1);
      }
    }
    this.randomSet$.next(res);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
