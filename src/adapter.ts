/* eslint-disable no-console */
import type { FindResourcesRequest, FindResourcesResponse, Resource, Embed }
 from "@canva/app-components";


export async function findResources( request: FindResourcesRequest<"folder"> ): Promise<FindResourcesResponse> {

  const apiKey = process.env.GOOGLE_API_KEY || "";
  let resources: Resource[] = [];
  let placesData:any;
  try {
     request.query ? placesData = await getPlaces(apiKey,request) : placesData = getInitialData()
    
    if (placesData && placesData?.places?.length > 0) {
      resources = placesData?.places?.map((place:any) => {
        const { latitude, longitude } = place?.location || {};
        const placeId = place?.id;
        const address = place?.formattedAddress  || "";
        const name = place?.displayName?.text  || ""
        const mapThumbnailUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=600x400&markers=color:red%7Clabel:%7C${latitude},${longitude}&key=${apiKey}`;
        const mapEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16`;
        return {
          id: placeId,
          name,
          description: address,
          url: mapEmbedUrl,
          thumbnail: {
            url: mapThumbnailUrl,
          },
          type: "EMBED",
        } satisfies Embed;
      });
      return {
        type: "SUCCESS",
        resources,
        continuation: placesData && placesData?.nextPageToken,
      };
    } else {
      return {
        type: "SUCCESS",
        resources,
      };
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    return {
      type: "ERROR",
      errorCode: "INTERNAL_ERROR",
    };

  }

}

/**
 * Fetches places based on the provided query and request details.
 * @param {string} apiKey - The API key for accessing Google Places API.
 * @param {FindResourcesRequest<"folder">} request - The request object containing search query, filters, and pagination details.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing place data from the Google Places API.
 */

const getPlaces = async ( apiKey: string, request: FindResourcesRequest<"folder"> ): Promise<any> => {
     
    let query = request?.query;
    const {status,query:updatedQuery} = isCoordinate(query);
    if(status){
      const response  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${updatedQuery}&key=${apiKey}`)
      const geocodeData = await response.json() 
      const firstResult = geocodeData.results[0]
      const locationName  = firstResult.address_components.find((component:any) => 
        component.types.includes("locality") || component.types.includes("administrative_area_level_1")
      )?.long_name || "Unknown Place"; 

      return {
        places:[
          {
           id:firstResult.place_id,
           formattedAddress:firstResult.formatted_address,
           displayName:{
            text:locationName
           },
           location:{
            longitude:firstResult.geometry.location.lng,
            latitude:firstResult.geometry.location.lat
           }

          }
        ]
      }
      

    }



  const selectedFileTypes: string[] = request?.filters?.selectedOptions?.services?.selected || [];
    if ( selectedFileTypes.length > 0 && selectedFileTypes[0] !== "all") {
      query =  selectedFileTypes[0]  + " in " + query;
    }

  const apiUrl = "https://places.googleapis.com/v1/places:searchText";
  const nextPageToken = request?.continuation || null;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.formattedAddress,places.location,places.displayName,nextPageToken'
    },
    body: JSON.stringify({
      textQuery: query,
      pageToken: nextPageToken,
    })
  });
  const places = await response.json();
  return places;

};

const getInitialData = ():any =>{
  const response:any = {
    places: [
        {
            "name": "places/ChIJGymPrIdFWBQRJCSloj8vDIE",
            "id": "ChIJGymPrIdFWBQRJCSloj8vDIE",
            "formattedAddress": "Al Haram, Nazlet El-Semman, Al Haram, Giza Governorate 3512201, Egypt",
            "plusCode": {
                "globalCode": "7GXHX4HM+MM",
                "compoundCode": "X4HM+MM Al Haram, Egypt"
            },
            "location": {
                "latitude": 29.979170500000002,
                "longitude": 31.134204599999997
            },
         
            "rating": 4.6,
            "googleMapsUri": "https://maps.google.com/?cid=9298859280971408420",
            "websiteUri": "https://egymonuments.gov.eg/en/monuments/the-great-pyramid",
            "userRatingCount": 27447,
            "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
            "iconBackgroundColor": "#13B5C7",
            "displayName": {
                "text": "The Great Pyramid of Giza",
                "languageCode": "en"
            },
            "shortFormattedAddress": "Al Haram, Nazlet El-Semman, Al Haram",
            "goodForChildren": true,
            "accessibilityOptions": {
                "wheelchairAccessibleParking": true,
                "wheelchairAccessibleEntrance": true
            },
        },
  {
    "name": "places/ChIJzyx_aNch8TUR3yIFlZslQNA",
    "id": "ChIJzyx_aNch8TUR3yIFlZslQNA",
    "formattedAddress": "Huairou District, China, 101406",
    "plusCode": {
        "globalCode": "8PGRCHJC+Q4",
        "compoundCode": "CHJC+Q4 Sanduhe Town, Huairou District, Beijing, China"
    },
    "location": {
        "latitude": 40.4319077,
        "longitude": 116.57037489999999
    },
    "rating": 4.3,
    "googleMapsUri": "https://maps.google.com/?cid=15006035308548793055",
    "websiteUri": "http://www.mutianyugreatwall.com/",
    "businessStatus": "OPERATIONAL",
    "userRatingCount": 17427,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    "iconBackgroundColor": "#13B5C7",
    "displayName": {
        "text": "Great Wall of China",
        "languageCode": "en"
    },
    "shortFormattedAddress": "Mutianyu Great Wall Travel Area, Huai Rou Qu",
    "goodForChildren": true,
    "accessibilityOptions": {
        "wheelchairAccessibleParking": true,
        "wheelchairAccessibleEntrance": true
    },
},
  {
    "name": "places/ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
    "id": "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
    "formattedAddress": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    "plusCode": {
        "globalCode": "8FHJVFRR+3V",
        "compoundCode": "VFRR+3V Rome, Metropolitan City of Rome Capital, Italy"
    },
    "location": {
        "latitude": 41.8902102,
        "longitude": 12.4922309
    },
    "rating": 4.7,
    "googleMapsUri": "https://maps.google.com/?cid=2950359333223072708",
    "websiteUri": "https://colosseo.it/",
    "userRatingCount": 417403,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    "iconBackgroundColor": "#13B5C7",
    "displayName": {
        "text": "Colosseum",
        "languageCode": "en"
    },
    "shortFormattedAddress": "Piazza del Colosseo, 1, Roma",
    "goodForChildren": true,
    "accessibilityOptions": {
        "wheelchairAccessibleEntrance": true,
        "wheelchairAccessibleRestroom": true,
        "wheelchairAccessibleSeating": false
    },
  
},

{
    "name": "places/ChIJVVVViV-abZERJxqgpA43EDo",
    "id": "ChIJVVVViV-abZERJxqgpA43EDo",
    "formattedAddress": "08680, Peru",
    "plusCode": {
        "globalCode": "57R9RFP3+PV",
        "compoundCode": "RFP3+PV Aguas Calientes, Peru"
    },
    "location": {
        "latitude": -13.1631988,
        "longitude": -72.5452621
    },
    "rating": 4.8,
    "googleMapsUri": "https://maps.google.com/?cid=4183904589858216487",
    "websiteUri": "https://www.machupicchu.gob.pe/",
    "userRatingCount": 78965,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    "iconBackgroundColor": "#13B5C7",
    "displayName": {
        "text": "Historic Sanctuary of Machu Picchu",
        "languageCode": "en"
    },
    "goodForChildren": true,
    "accessibilityOptions": {
        "wheelchairAccessibleEntrance": false
    },
   
},

{
    "name": "places/ChIJ58CR48Y4UY8Rmk2ZaKGgHnw",
    "id": "ChIJ58CR48Y4UY8Rmk2ZaKGgHnw",
    "formattedAddress": "97751 Yucatan, Mexico",
    "plusCode": {
        "globalCode": "76GHMCMJ+PV",
        "compoundCode": "MCMJ+PV San Felipe Nuevo, Yuc., Mexico"
    },
    "location": {
        "latitude": 20.684284899999998,
        "longitude": -88.5677826
    },
    "rating": 4.8,
    "googleMapsUri": "https://maps.google.com/?cid=8943762525109439898",
    "websiteUri": "http://www.inah.gob.mx/es/zonas/146-zona-arqueologica-de-chichen-itza",
    "userRatingCount": 124828,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    "iconBackgroundColor": "#7B9EB0",
    "displayName": {
        "text": "Chichén Itzá",
        "languageCode": "en"
    },
    "goodForChildren": true,
    "accessibilityOptions": {
        "wheelchairAccessibleParking": true,
        "wheelchairAccessibleEntrance": true
    },
},

{
    "name": "places/ChIJbf8C1yFxdDkR3n12P4DkKt0",
    "id": "ChIJbf8C1yFxdDkR3n12P4DkKt0",
    "formattedAddress": "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India",
    "plusCode": {
        "globalCode": "7JVW52GR+3V",
        "compoundCode": "52GR+3V Agra, Uttar Pradesh, India"
    },
    "location": {
        "latitude": 27.175144799999998,
        "longitude": 78.0421422
    },
    "rating": 4.6,
    "googleMapsUri": "https://maps.google.com/?cid=15936801470875598302",
    "websiteUri": "https://www.tajmahal.gov.in/",
    "userRatingCount": 236434,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/monument_pinlet",
    "iconBackgroundColor": "#7B9EB0",
    "displayName": {
        "text": "Taj Mahal",
        "languageCode": "en"
    },
    "goodForChildren": true,
    "accessibilityOptions": {
        "wheelchairAccessibleParking": true,
        "wheelchairAccessibleEntrance": true
    },
  
},

{
    "name": "places/ChIJP6FKmNV_mQAR3gKVAdeEyZ0",
    "id": "ChIJP6FKmNV_mQAR3gKVAdeEyZ0",
    "formattedAddress": "Parque Nacional da Tijuca - Alto da Boa Vista, Rio de Janeiro - RJ, 22261, Brazil",
    "plusCode": {
        "globalCode": "589R2QXQ+6R",
        "compoundCode": "2QXQ+6R Alto da Boa Vista, Rio de Janeiro - State of Rio de Janeiro, Brazil"
    },
    "location": {
        "latitude": -22.951916,
        "longitude": -43.210487199999996
    },
    "rating": 4.8,
    "googleMapsUri": "https://maps.google.com/?cid=11369764793252905694",
    "websiteUri": "https://santuariocristoredentor.com.br/",
    "userRatingCount": 120910,
    "iconMaskBaseUri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    "iconBackgroundColor": "#7B9EB0",
    "displayName": {
        "text": "Christ the Redeemer",
        "languageCode": "en"
    },
    "accessibilityOptions": {
        "wheelchairAccessibleParking": true,
        "wheelchairAccessibleEntrance": true
    }
}

]
 }

  return response
}

function isCoordinate(query:string=""):{status:boolean,query:string}{
    
  const coordinatePattern = /^-?\d+(\.\d+)?$/;
  const parts = query.trim().split(/[\s,]+/).map(Number);
    if (parts.length !== 2) return {status:false,query}; 
    const [lat, lon] = parts;
    return {
       status : coordinatePattern.test(String(lat)) &&
        coordinatePattern.test(String(lon)) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180,
        query : parts+""
      }
    
    

}

