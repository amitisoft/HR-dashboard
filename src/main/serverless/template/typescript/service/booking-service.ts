import {Observable, Observer} from 'rxjs';
import {Injectable} from "@angular/core";
import {Booking} from '../domain/booking';
import {BookingDto} from "../dto/booking-dto"
import {Candidate} from "../domain/candidate";
import {DynamoDB, SES} from "aws-sdk";
// import { StartTestBooking} from "../domain/start-test-booking"

import DocumentClient = DynamoDB.DocumentClient;

var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

@Injectable()
export class BookingServiceImpl {

    constructor() {

    }

    /**
     * updateBookingAfterStartTest
     * @param data 
     */
    updateBookingAfterStartTest(data: any): Observable<Booking> {
        console.log("in CandidateServiceImpl update()");
        console.log(`data received ${data.category}`);
        console.log(`data received ${data.jobPostion}`);
        console.log(`data received ${data.DOE}`);
        console.log(`data received ${data.paperType}`);

        const documentClient = new DocumentClient();
        const params = {
            TableName: "booking",
            Key: {
                bookingId: data.bookingId,
            },
            ExpressionAttributeNames: {
                '#ca': 'category',
                '#jp': 'jobPostion',
                '#DOE': 'DOE',
                '#ts':'testStatus',
                '#pt':'paperType',
                '#cid':'candidateId'
            },
            ExpressionAttributeValues: {
                ':ca': data.category,
                ':jp': data.jobPostion,
                ':DOE': data.DOE,
                ':ts':data.testStatus,
                ':pt':data.paperType,
                ':cid':data.candidateId
            },
            UpdateExpression: 'SET #ca = :ca,#jp=:jp, #DOE = :DOE, #ts= :ts, #pt =:pt, #cid=:cid',
            ReturnValues: 'ALL_NEW',
        };

        return Observable.create((observer:Observer<Booking>) => {

            documentClient.update(params, (err, data: any) => {
                if(err) {
                    console.error(err);
                    observer.error(err);
                    return;
                }
                console.log(`result ${JSON.stringify(data)}`);   
                observer.next(data.Attributes);
                observer.complete();
            });
        });
    }

/**
 * get the data who are not taken the test.......
 * data whichcontains last data of previous query
 */
    getWhoNotTakenTest(lastEvaluatedKey:any): Observable<Booking[]> {

    const queryParams: DynamoDB.Types.QueryInput = {
        TableName: "booking",
        IndexName: "testStatusGSI",
        KeyConditionExpression: "#testStatus = :v_test",
        ExpressionAttributeNames:{
                 "#testStatus": "testStatus"
             },
        ExpressionAttributeValues : {
            ":v_test": "test not taken"
        },
        Limit: 2,
        ProjectionExpression : "candidateId, category,testStatus,bookingId",
        ScanIndexForward : false
    }
    
    if (lastEvaluatedKey){
        console.log("-----------------------------with data-----------------------");
        console.log(" data-------------",lastEvaluatedKey.candidateId);
        queryParams.ExclusiveStartKey= { bookingId: lastEvaluatedKey.bookingId,
                                        testStatus: lastEvaluatedKey.testStatus,
                                        candidateId: lastEvaluatedKey.candidateId }
    } else {
        console.log("----------------------------without data----------------------");
    }

    const documentClient = new DocumentClient();
    return Observable.create((observer:Observer<Booking>) => {
            documentClient.query(queryParams,(err,data:any) => {
                if(err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    observer.complete();
                    return;
                }
                console.log("LastEvaluatedKey=",data.LastEvaluatedKey);
                observer.next((data.Items));
                observer.complete();
                });           
            });
    }

    /**
     * { bookingId: '1',
  testStatus: 'test not taken',
  candidateId: '5' }
     */





    /**
     * get candidate information 
     *
     */

    getAllCandidateInfoWhoNotTakenTest(data:any): Observable<Booking[]>{
        const candidateKey = [];
        data.forEach((item)=> {
            console.log("in side for each");
            let myObj = {"candidateId": ""};
            myObj.candidateId = item.candidateId;
            candidateKey.push(myObj);
        });
        console.log("out side");
        var params = {
                    RequestItems: {
                    "candidate": {
                                    Keys: candidateKey,
                                    ProjectionExpression: "email,firstName,lastName,candidateId"
                                    }
                        }
                    };
        const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<Booking>) => {
                documentClient.batchGet(params, function(err, data1) {
                        if(err) {
                                observer.error(err);
                                throw err;
                                }
        else {
                    let resultArray:any = [];
                   // console.log("booking data = ",data);
                    let res = (JSON.parse(JSON.stringify(data1.Responses))).candidate;
                  //  console.log("res = ",res);
                    data.forEach((item)=>{
                            let newArray = res.filter((id)=>{ 
                                        return(id.candidateId === item.candidateId)});
                          //  console.log("new array", newArray[0]);
                          //  console.log("item = ",item.candidateId);
                            // if (newArray != undefined){
                            let bookinginfo = new Booking();
                            bookinginfo.candidateId = item.candidateId;
                            bookinginfo.candidateId = item.candidateId;
                            bookinginfo.testStatus = item.testStatus;
                            bookinginfo.bookingId = item.bookingId;
                            bookinginfo.category = item.category;
                            bookinginfo.fullName = `${newArray[0].firstName} ${newArray[0].lastName}`;
                            bookinginfo.email = newArray[0].email;
                            resultArray.push(bookinginfo);
                          //  console.log(" result", bookinginfo);
                    //     }
         
                    })
                    observer.next(resultArray);
                    observer.complete();
            }         
        });
    });
}
}
