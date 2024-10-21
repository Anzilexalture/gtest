import type { Config } from "@canva/app-components";

type ContainerTypes = "folder";
export const config: Config<ContainerTypes> = {
  serviceName: "Example App",
  search: {
    enabled: true,
    filterFormConfig: {
      containerTypes: ["folder"],
      filters: [
        {
          filterType: "CHECKBOX",
          label: "File Type",
          key: "fileType",
          options: [
            { value: "hotel", label: "HOTEL" },
            { value: "hospital", label: "HOSPITAL" },
            { value: "school", label: "SCHOOL" },

          ],
          allowCustomValue: true,
        },
      ],
    },
  },
  
  containerTypes: [
  ],

  layouts: ["FULL_WIDTH"],
  resourceTypes: ["EMBED"],
  moreInfoMessage:
    "Map implementation.",
};
