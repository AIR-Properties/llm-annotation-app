import { UIResponse } from "../types/domain";

export const SAMPLE_RESULTS: UIResponse[] = [
  {
    id: "response_1",
    title: "LLM Result 1",
    text: "This is a sample answer from LLM 1. It provides a detailed explanation of the query.",
    prompt_id: "sample_1",
    answer_id: "response_1",
    created_at: new Date().toISOString(),
  },
  {
    id: "response_2",
    title: "LLM Result 2",
    text: "This is a sample answer from LLM 2. It offers insights and possible solutions.",
    prompt_id: "sample_1",
    answer_id: "response_2",
    created_at: new Date().toISOString(),
  },
  {
    id: "response_3",
    title: "LLM Result 3",
    text: "This is a sample answer from LLM 3. It discusses various aspects of the topic.",
    prompt_id: "sample_1",
    answer_id: "response_3",
    created_at: new Date().toISOString(),
  },
];

export const SAMPLE_ANNOTATIONS = {
  message: "OK",
  data: [
    {
      id: "prompt_1",
      prompt:
        "What are the key features and amenities of this property that make it stand out in the luxury real estate market? Please provide a detailed analysis of its unique selling points and how they compare to similar properties in the area.",
      metadata: {
        link: "https://www.propertyfinder.ae/en/property/luxury-villa-palm-jumeirah",
      },
      responses: [
        {
          id: "response_1_1",
          title: "Comprehensive Analysis",
          text: "This luxury property stands out with its exceptional features including a state-of-the-art smart home system, integrated throughout the residence. The property boasts a 1,000-square-foot master suite with panoramic ocean views, a private terrace, and a spa-like bathroom featuring heated floors and a freestanding soaking tub. The gourmet kitchen is equipped with top-of-the-line appliances and custom cabinetry, making it perfect for both everyday use and entertaining.",
          created_at: new Date().toISOString(),
        },
        {
          id: "response_1_2",
          title: "Market Comparison",
          text: "Compared to similar properties in the area, this residence offers unique advantages such as its prime location with direct beach access and unobstructed ocean views. The property includes a private infinity pool and landscaped gardens, features found in only 15% of luxury homes in this market. The dedicated home theater and wine cellar add significant value, while the four-car garage with electric vehicle charging stations appeals to modern luxury buyers.",
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "prompt_2",
      prompt:
        "Can you describe the neighborhood and surrounding area of this property, including nearby amenities, schools, and transportation options? Please provide specific details about the community and its appeal to potential buyers.",
      metadata: {
        link: "https://www.propertyfinder.ae/en/area-guide/downtown-dubai",
        additionalInfo: "Downtown Dubai Community Guide",
      },
      responses: [
        {
          id: "response_2_1",
          title: "Location Overview",
          text: "The property is situated in the prestigious North Shore district, known for its excellent schools and safe, family-friendly environment. Within walking distance, residents can find high-end boutiques, Michelin-starred restaurants, and artisanal cafes. The area is served by top-rated schools, including the renowned Lincoln Elementary (rated 9/10) and Washington High School (rated 10/10), making it ideal for families with school-age children.",
          created_at: new Date().toISOString(),
        },
        {
          id: "response_2_2",
          title: "Transportation and Accessibility",
          text: "Transportation options are abundant, with the express train station just a 5-minute walk away, offering a 20-minute commute to downtown. The international airport is accessible within 30 minutes by car or express shuttle. The neighborhood features extensive bike lanes and walking paths, connecting to major parks and recreational areas. Additionally, the area is served by multiple bus lines and ride-sharing services are readily available.",
          created_at: new Date().toISOString(),
        },
      ],
    },
  ],
};

export const SAMPLE_NEW_ANNOTATIONS = {
  message: "OK",
  data: [
    {
      prompt_id: "prompt_1",
      prompt:
        "What are the key features and amenities of this property that make it stand out in the luxury real estate market?",
      metadata: {
        link: "https://www.propertyfinder.ae/en/property/luxury-villa-palm-jumeirah",
      },
      response: {
        id: "response_1",
        title: "AIR",
        text: "This luxury property features a state-of-the-art smart home system and panoramic ocean views. The property includes a private infinity pool and direct beach access.",
        created_at: new Date().toISOString(),
      },
    },
    {
      prompt_id: "prompt_1",
      prompt: "Second prompt",
      metadata: {
        link: "https://www.propertyfinder.ae/en/property/luxury-villa-palm-jumeirah",
      },
      response: {
        id: "response_1",
        title: "AIR",
        text: "The answer",
        created_at: new Date().toISOString(),
      },
    },
  ],
};
