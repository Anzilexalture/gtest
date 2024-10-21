/* eslint-disable no-console */
import type {
  FindResourcesRequest,
  FindResourcesResponse,
  Resource,
  Embed,
} from "@canva/app-components";

// Function to find resources based on the request.
export async function findResources( request: FindResourcesRequest<"folder"> ): Promise<FindResourcesResponse> {

  const apiKey = "";
  let resources: Resource[] = [];
  try {
    const places = await getPlaces(apiKey, request);
    console.log("results", places);
    
    if (places?.status === "OK" && places?.results?.length > 0) {
      resources = places?.results?.map((place) => {
        const { lat, lng } = place?.geometry?.location || {};
        const placeId = place?.place_id;
        const address = place?.formatted_address;
        const mapThumbnailUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x400&markers=color:red%7Clabel:%7C${lat},${lng}&key=${apiKey}`;
        const mapEmbedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
        return {
          id: placeId,
          name: place.name,
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
        continuation: places && places?.next_page_token,
      };
    } else {
      // Handle cases where no results were found or the status is not OK.
      return {
        type: "SUCCESS",
        resources,
      };
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    // Handle network or unexpected errors.
    return {
      type: "ERROR",
      errorCode: "INTERNAL_ERROR",
    };

    // need clarity on return when any catch error occured
    // return {
    //   type: "SUCCESS",
    //   resources
    // }
  }

  // return results;
}

/**
 * Fetches places based on the provided query and request details.
 * @param {string} apiKey - The API key for accessing Google Places API.
 * @param {FindResourcesRequest<"folder">} request - The request object containing search query, filters, and pagination details.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing place data from the Google Places API.
 */

const getPlaces = async ( apiKey: string, request: FindResourcesRequest<"folder"> ): any => {

  let query = request?.query || "tajmahal";
  const selectedFileTypes: string[] = request?.filters?.selectedOptions?.fileType?.selected || [];

  if (selectedFileTypes && selectedFileTypes.length > 0) {
    const fileTypeString = selectedFileTypes.join(selectedFileTypes.length > 1 ? " " : "");
    query += " " + fileTypeString;
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;
  const nextPageToken = request?.continuation || null;
  const requestUrl = nextPageToken ? `${apiUrl}&pagetoken=${nextPageToken}`: apiUrl;
  const response = await fetch(requestUrl);
  const places = await response.json();

  return places;
};
