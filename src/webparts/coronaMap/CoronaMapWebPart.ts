import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape, debounce } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import styles from './CoronaMapWebPart.module.scss';
import * as strings from 'CoronaMapWebPartStrings';
import {HttpClient, IHttpClientOptions, HttpClientResponse} from '@microsoft/sp-http';
import * as $ from 'jquery';  
import 'DataTables.net';  

export interface ICoronaMapWebPartProps {
  description: string;
}

export default class CoronaMapWebPart extends BaseClientSideWebPart<ICoronaMapWebPartProps> {
  
  public render(): void {
    this.domElement.innerHTML = `
    <table id="example" class="display" width="100%"></table>`;  
    //Loading Jquery Datatable CSS file to get required look and feel, somehow It thought installing  
    // datatable package will load css also but it did not worked so I had explicitly call it here.  
    SPComponentLoader.loadCss("https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css");  
    this.useVectorMap();
  }

  protected useVectorMap():any{
      var httpClient: HttpClient;
      const requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');
      const httpClientOptions: IHttpClientOptions = {
        body: null,
        headers: requestHeaders
      };
      this.context.httpClient.get("https://api.covid19api.com/summary",
       HttpClient.configurations.v1,
      httpClientOptions)
      .then((response:HttpClientResponse)=>{
        response.json().then((responseJSON: any) => { 
          if (responseJSON!=null && responseJSON.Countries!=null){ 
            console.log(responseJSON);
            var jsonArray = responseJSON.Countries.map(
              function (item) {  
              return [  
                  item.Country,  
                  item.CountryCode,  
                  item.Slug,  
                  item.NewConfirmed,  
                  item.TotalConfirmed,  
                  item.NewDeaths,
                  item.TotalDeaths,
                  item.NewRecovered,
                  item.TotalRecovered,
                  item.Date
              ];  
          });  
          console.log(jsonArray);

           // Intializing Datatable by passing jsonArray, specifying columns names here, please note that this should be   
                // in sequence of above jsonArray attributes values, it would be mapped one to one.  
                $('#example').DataTable( {  
                  data: jsonArray,  
                  columns: [  
                      { title: "Country" },
                      { title: "NewConfirmed" },  
                      { title: "TotalConfirmed" },  
                      { title: "NewDeaths" },  
                      { title: "TotalDeaths" },  
                      { title: "NewRecovered" },  
                      { title: "TotalRecovered" },  
                      { title: "Date",
                      "render": function ( data, type, row ) {
                        return  var d = new Date(data.Date);
                    }
                    } 
                      
                  ]  
              } ); 
             }
        });  
      });
  } 
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
