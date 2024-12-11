import type { Config } from "@canva/app-components";

type ContainerTypes = "folder";
export const config: Config<ContainerTypes> = {
  serviceName: "Google map",
  search: {
    enabled: true,
    placeholder:"Search places",
    filterFormConfig: {
      
      filters: [
        {
          filterType: "RADIO",
          label: "Services",
          key: "services",
          options: [
            { value: "hotels", label: "Hotels" },
            { value: "restaurants", label: "Restaurants" },
            { value: "hospital", label: "Hospital" },
            { value: "school", label: "School" },
            { value: "atms", label: "ATMs" },
            { value: "petrol", label: "Petrol" },
            { value: "post", label: "Post" },
          ]
        },
       
      ],
    },
  },
  layouts: ["FULL_WIDTH"],
  resourceTypes: ["EMBED"]
};
