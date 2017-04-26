import { CandidateFacade } from '../facade/candidate-facade';
import { Injector } from '@angular/core';
import { HttpContextImpl } from "../http/http-context-impl";

import {BookingFacade} from "../facade/booking-facade"

export class GetCandidateHandler {

    static getAllCandidates (httpContext:HttpContextImpl,injector:Injector) : void {

        injector.get(CandidateFacade).getAll()
            .subscribe(result => {
                httpContext.ok(200, result);
            },  err => {
                httpContext.fail(err, 500);
        });
    }


    static findCandidateById (httpContext:HttpContextImpl,injector:Injector) : void {

        let pathParameters = httpContext.getPathParameters();
        console.log(JSON.stringify(pathParameters));

        let candidateId = pathParameters.id;

        injector.get(CandidateFacade).findbyId(candidateId)
            .subscribe(result => {
                httpContext.ok(200, result);
            },  err => {
                httpContext.fail(err, 500);
            });

        // injector.get(CandidateFacade).findbyId(candidateId)
        //     .subscribe(result => {
        //         injector.get(CandidateFacade).findbyEmail(candidateId)
        //             .subscribe(result => {
        //                 httpContext.ok(200, result);
        //             });
        //     },  err => {
        //         httpContext.fail(err, 500);
        //     });
    }

    static updateBooking(httpContext:HttpContextImpl,injector:Injector) : void {

        let pathParameters = httpContext.getPathParameters();
        console.log(JSON.stringify(pathParameters));

        let data = httpContext.getRequestBody();
        console.log("pathParameters = ",data);
        injector.get(BookingFacade).updateBooking(data)
            .subscribe(result => {
                httpContext.ok(200, result);
            },  err => {
                httpContext.fail(err, 500);
            });
    }


    static updateCandidate(httpContext:HttpContextImpl,injector:Injector) : void {

        let pathParameters = httpContext.getPathParameters();
        console.log(JSON.stringify(pathParameters));

        let data = httpContext.getRequestBody();
        console.log("data = ",data);
        injector.get(CandidateFacade).updateCandidate(data)
            .subscribe(result => {
                httpContext.ok(200, result);
            },  err => {
                httpContext.fail(err, 500);
            });
    }

    static testCheck(httpContext:HttpContextImpl,injector:Injector) : void {

        let pathParameters = httpContext.getPathParameters();
        console.log(JSON.stringify(pathParameters));

        let data = httpContext.getRequestBody();
        console.log("data = ",data);
        injector.get(BookingFacade).getBookingWhoNotTakenTest()
            .subscribe(result => {
                console.log("myresult = ",result);
                injector.get(BookingFacade).getAllBookings(result)
                    .subscribe(result1 => {
                        console.log("myresult = ",result1);
                        httpContext.ok(200, result1);
                    });
              //  httpContext.ok(200, result);
            },  err => {
                httpContext.fail(err, 500);
            });
    }

}