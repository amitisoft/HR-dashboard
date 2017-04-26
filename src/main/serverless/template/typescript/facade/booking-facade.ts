import { Observable, Observer } from 'rxjs';
import {Injectable} from "@angular/core";
import { BookingServiceImpl } from '../service/booking-service';
import { BookingDto } from '../dto/booking-dto';
import { BookingsDto } from '../dto/bookings-dto';
import { Booking } from '../domain/booking';

@Injectable()
export class BookingFacade {

    constructor(private bookingService: BookingServiceImpl) {
    }

    // getAll(): Observable<BookingsDto> {
    //     console.log("in BookingFacade getAll()");

    //     return this.bookingService.getBookingWhoNotTakenTest()
    //         .map((bookings) => {
    //             return {
    //                 bookings: bookings.map(this.mapBookingToDto)
    //             }
    //         });
    // }

    // private mapBookingToDto(booking: Booking): BookingDto {
    //     console.log("in mapBookingToDto");
    //     return {
    //        candidateId: "",
    //        category:"",

    //     }
    // }


    // createBooking(data: any) : Observable<Booking> {
    //     //validate data as per business logic
    //     return this.bookingService.create(data);
    // }


    updateBooking(data: any) :Observable<Booking> {
        return this.bookingService.update(data);
    }

    getBookingWhoNotTakenTest() :Observable<Booking[]> {
        return this.bookingService.getAllBookings();
    }

    // findBooking(bookingId: string) : Observable<Booking> {
    //     return this.bookingService.find(candidateId);
    // }

    getAllBookings(data:any): Observable<BookingsDto> {
             console.log("in BookingFacade getAll()");

        return this.bookingService.getCandidateByBatch(data)
            .map((bookings) => {
                console.log("map = ",bookings);
                return {
                    bookings: bookings.map(this.mapBookingToDto)
                }
            });
    }

    private mapBookingToDto(booking: Booking): BookingDto {
        console.log("in mapBookingToDto", booking);
        return {
           candidateId: booking.candidateId,
    category: booking.category,
    jobPostion: booking.jobPostion,
    DOE: "",
    testStatus: booking.testStatus,
    startTime: 5,
    paperType:"",
    candidateFullName:booking.fullName,
    candidateMailId:booking.email
        }
    }


}