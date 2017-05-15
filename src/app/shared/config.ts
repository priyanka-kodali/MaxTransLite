import { environment } from '../../environments/environment';


 export var ApiUrl : string = "http://localhost:64669";

//  export var ApiUrl= "https://maxtransliteapi.azurewebsites.net";


if(environment.production){
    // ApiUrl= "https://stagingmaxtransliteapi.azurewebsites.net";
    ApiUrl= "https://maxtransliteapi.azurewebsites.net";
}

