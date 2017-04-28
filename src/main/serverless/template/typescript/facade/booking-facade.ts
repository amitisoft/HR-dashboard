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

    updateBookingAfterStartTest(data: any) :Observable<Booking> {
        return this.bookingService.updateBookingAfterStartTest(data);
    }

    getWhoNotTakenTest(data:any) :Observable<Booking[]> {
        return this.bookingService.getWhoNotTakenTest(data);
    }

    getAllCandidateInfoWhoNotTakenTest(data:any): Observable<BookingsDto> {
             console.log("in BookingFacade getAll()");

        return this.bookingService.getAllCandidateInfoWhoNotTakenTest(data)
            .map((bookings) => {
                console.log("map = ",bookings);
                return {
                    bookings: bookings.map(this.mapBookingToDto)
                }
            });
    }

    private mapBookingToDto(booking: Booking): BookingDto {
        console.log("in mapBookingToDto", booking);
        let formate = {year:"numeric", month:"numeric",day:"numeric"};
        let date = new Date(new Date().getUTCDate());
        return {
                candidateId: booking.candidateId,
                category: booking.category,
                jobPostion: booking.jobPostion,
                DOE: new Date().toDateString(),
                testStatus: booking.testStatus,
                startTime: 5,
                paperType:"",
                candidateFullName:booking.fullName,
                candidateMailId:booking.email,
                bookingId : booking.bookingId
            }
    }


}