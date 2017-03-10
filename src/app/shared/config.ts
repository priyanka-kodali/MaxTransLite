import { environment } from '../../environments/environment';


 export var ApiUrl : string = "http://localhost:64669";

// export const ApiUrl : string = "https://maxtransliteapi.azurewebsites.net";

if(environment.production){
    ApiUrl= "https://stagingmaxtransliteapi.azurewebsites.net";
}

