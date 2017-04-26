import {Observable, Observer} from 'rxjs';
import {Injectable} from "@angular/core";
import {Booking} from '../domain/booking';
import {BookingDto} from "../dto/booking-dto"
import {Candidate} from "../domain/candidate";
import {DynamoDB, SES} from "aws-sdk";
import { StartTestBooking} from "../domain/start-test-booking"

import DocumentClient = DynamoDB.DocumentClient;

// var uuid = require('uuid');
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

export interface BookingService {
    update(data: any): Observable<Booking>;
    getBookingWhoNotTakenTest():Observable<Booking[]>;
    getAllBookings():Observable<Booking[]>;
}
@Injectable()
export class BookingServiceImpl {

    public bookingObj:any={
        "candidateId":"",
        "fullName":"",
        "testStatus":"",
        "email":"",
        "category":"",
        "paperType":"",
        "DOE":"",
        "jobPostion":""
    };

    constructor() {

    }
    update(data: any): Observable<Booking> {
        console.log("in CandidateServiceImpl update()");
        console.log(`data received ${data.category}`);
        console.log(`data received ${data.jobPostion}`);
        console.log(`data received ${data.DOE}`);
        console.log(`data received ${data.paperType}`);

        const documentClient = new DocumentClient();
        const params = {
            TableName: "booking1",
            Key: {
                candidateId: data.candidateId,
            },
            ExpressionAttributeNames: {
                '#ca': 'category',
                '#jp': 'jobPostion',
                '#DOE': 'DOE',
                '#ts':'testStatus',
                '#pt':'paperType'
            },
            ExpressionAttributeValues: {
                ':ca': data.category,
                ':jp': data.jobPostion,
                ':DOE': data.DOE,
                ':ts':data.testStatus,
                ':pt':data.paperType
            },
            UpdateExpression: 'SET #ca = :ca,#jp=:jp, #DOE = :DOE, #ts= :ts, #pt =:pt',
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

    getBookingWhoNotTakenTest():Observable<Booking[]> {

        const queryParams: DynamoDB.Types.QueryInput = {

          
    "TableName": "booking",
    "IndexName": "testStatusGSI",
    "KeyConditionExpression": "#testStatus = :v_test",
    ExpressionAttributeNames:{
                 "#testStatus": "testStatus"
             },
    "ExpressionAttributeValues": {
        ":v_test": "test not taken"
    },
    "ProjectionExpression": "candidateId, category, testStatus",
    "ScanIndexForward": false

            // TableName: "booking",
            // ProjectionExpression: "candidateId, category, jobPostion, DOE, testStatus,paperType",
            // KeyConditionExpression: "#candidateId = :candidateIdFilter",
            // ExpressionAttributeNames:{
            //     "#candidateId": "candidateId"
            // },
            // ExpressionAttributeValues: {
            //     ":candidateIdFilter": "1"
            // }
        }
        const documentClient = new DocumentClient();
        const candidateIdArray = [];
             return Observable.create((observer:Observer<BookingDto>) => {
            console.log("Executing query with parameters " + queryParams);
            documentClient.query(queryParams,(err,data:any) => {
                if(err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    console.log("no data received for getAll candidates");
                    observer.complete();
                    return;
                }
                data.Items.forEach((item) => {
                    console.log(`candidate Id ${item.candidateId}`);
                    console.log(`candidate category ${item.category}`);
                     console.log(item);
                   console.log("calling candidateId");
                   candidateIdArray.push(item.candidateId);
              //     this.getCandidateInfo(item.candidateId);

                    // const params = {
                    //     Key: {
                    //              "candidateId": item.candidateId
                    //          }, 
                    //     TableName: "candidate"
                    //     };
                    //         const documentClient = new DocumentClient();
                    //          documentClient.get(params, function(err, data) {
                    //                 if (err){
                    //                         console.log(err, err.stack);
                    //                         }  
                    //                 else{
                    //                     console.log(data);
                    //                     // item.candidateMailId = data.Item.email;
                    //                     // item.candidateName = `${data.Item.firstName} ${data.Item.lastName}`;
                    //                     }             
                    //                 });
                        });

                // const arrayCandidateID = data.Items.filter(x =>{
                //     return x.candidateId;
                // });    
                // console.log(typeof data.Items); 
                // console.log(arrayCandidateID);
                 this.getCandidateInfo(candidateIdArray);
                observer.next(data.Items);
             //   this.getCandidateInfo(item.candidateId);
                observer.complete();

            });
        });
    }

    getCandidateInfo(candidateId:any){
        let candidateInfo:any = "";
        console.log("In get candidate",candidateId.length);
        for(let i=0 ; i<candidateId.length;i++){
            const params = {
                        Key: {
                                 "candidateId": candidateId[i]
                             }, 
                        TableName: "candidate"
                        };
        const documentClient = new DocumentClient();
        documentClient.get(params, function(err, data) {
                if (err){
                            console.log(err, err.stack);
                        }  
                else{
                        console.log(data);
                        candidateInfo += data.Item;
                }             
        });
        }
        console.log("final candidate",candidateInfo);
    }
    // }

/**
 * get the data who are not taken the test.......
 */
    getAllBookings(): Observable<Booking[]> {
        //console.log("in CandidateServiceImpl getAll()");

        const queryParams: DynamoDB.Types.QueryInput = {
    "TableName": "booking",
    "IndexName": "testStatusGSI",
    "KeyConditionExpression": "#testStatus = :v_test",
    ExpressionAttributeNames:{
                 "#testStatus": "testStatus"
             },
    "ExpressionAttributeValues": {
        ":v_test": "test not taken"
    },
    "ProjectionExpression": "candidateId, category,testStatus",
    "ScanIndexForward": false
        }

        const documentClient = new DocumentClient();
        return Observable.create((observer:Observer<StartTestBooking>) => {
            documentClient.query(queryParams,(err,data:any) => {
                console.log(`did we get error ${err}`);
                if(err) {
                    observer.error(err);
                    throw err;
                }
                console.log(`data items receieved ${data.Items.length}`);
                if(data.Items.length === 0) {
                    console.log("no data received for getAll candidates");
                    observer.complete();
                    return;
                }
               // data.Items.forEach((item) => {
                  //  console.log(`candidate Id ${item.candidateId}`);
                    // const params = {
                    //     Key: {
                    //              "candidateId": item.candidateId
                    //          }, 
                    //     TableName: "candidate"
                    //     };
                    //         const documentClient = new DocumentClient();
                    //          documentClient.get(params, function(err, data1) {
                    //                 if (err){
                    //                         console.log(err, err.stack);
                    //                         }  
                    //                 else{
                    //                     console.log(data1);
                    //                      let arraydata = data.Items.filter(x=> x.candidateId === item.candidateId);
                    //                      console.log(arraydata);
                    //                     // item.candidateMailId = data.Item.email;
                    //                     // item.candidateName = `${data.Item.firstName} ${data.Item.lastName}`;
                    //                     }             
                    //                 });
                    //    });
                          //  console.log(this.getCandidateByBatch(data.Items));
                          observer.next((data.Items));
                           //observer.next(data.Items);
                          observer.complete();
                });
               
                
            });
    }

/**
 * search candidate by get item
 * filter
 */
    getCandidateInformation(data:any) {
        let result={};
        data.forEach((item) => {
         const params = {
                        Key: {
                                 "candidateId": item.candidateId
                             },
                        ProjectionExpression : "email,firstName,lastName",
                        TableName: "candidate"
                        };
                            const documentClient = new DocumentClient();
                             documentClient.get(params, function(err, data1) {
                                    if (err){
                                            console.log(err, err.stack);
                                            return "error";
                                            }  
                                    else{
                                        console.log(data1);
                                        // data1.forEach((candidate) =>{
                                        // item.candidateMailId = candidate.email;
                                        //  item.candidateName = `${candidate.firstName} ${candidate.lastName}`;
                                        // });
                                         let arraydata = data.filter(x=> x.candidateId === item.candidateId);
                                        // console.log(arraydata);
                                        // console.log(data1.Item.email);
                                        //  item.candidateMailId = "candidate@gmail.com";//data1.Item.email;
                                       //  item.candidateName = "candidate Name";//`${data1.Item.firstName} ${data1.Item.lastName}`;
                                         result +=item;
                                          console.log(JSON.stringify(item));
                                        }             
                                    });
        });
        console.log("In get candidate Information");
        return data;
    }

    /**
     * search candidate information by Batch item
     *
     */

    getCandidateByBatch(data:any): Observable<Booking[]>{
       // console.log("in batch id");
        const candidateKey = [];
        data.forEach((item)=> {
            let myObj = {"candidateId": ""};
            myObj.candidateId = item.candidateId;
            candidateKey.push(myObj);
        });

      //  console.log(candidateKey);
        var params = {
  RequestItems: {
   "candidate": {
       Keys: candidateKey,
     ProjectionExpression: "email,firstName,lastName,candidateId"
    }
  }
 };
  const documentClient = new DocumentClient();
  return Observable.create((observer:Observer<StartTestBooking>) => {
 documentClient.batchGet(params, function(err, data1) {
    if(err) {
                    observer.error(err);
                    throw err;
                }
   else     {
      let resultArray:any = [];
      console.log("booking data = ",data);
      let res = (JSON.parse(JSON.stringify(data1.Responses))).candidate;
      console.log("res = ",res);
     data.forEach((item)=>{
         let newArray = res.filter((id)=>{ 
             return(id.candidateId === item.candidateId)});
         console.log("new array", newArray[0]);
         console.log("item = ",item.candidateId);
         let bookinginfo = new Booking();
         bookinginfo.candidateId = item.candidateId;
        bookinginfo.candidateId = item.candidateId;
        bookinginfo.testStatus = item.testStatus;
        bookinginfo.category = item.category;
        bookinginfo.fullName = `${newArray[0].firstName} ${newArray[0].lastName}`;
        bookinginfo.email = newArray[0].email;
        resultArray.push(bookinginfo);
         console.log(" result", bookinginfo);
     })
    observer.next(resultArray);
    observer.complete();
   }         
    });
});
    }
}



// {
//     "TableName": "GameScores",
//     "IndexName": "GameTitleIndex",
//     "KeyConditionExpression": "GameTitle = :v_title",
//     "ExpressionAttributeValues": {
//         ":v_title": {"S": "Meteor Blasters"}
//     },
//     "ProjectionExpression": "UserId, TopScore",
//     "ScanIndexForward": false
// }