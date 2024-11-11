import {
  Response,
  AskResponse,
  AnnotationsResponse,
  AnnotationPrompt,
  AnnotationResponse,
} from "../types/api";
import { Response as DomainResponse, UIResponse } from "../types/domain";

export function mapResponseToDomain(
  response: Response,
  promptId: string
): DomainResponse {
  return {
    id: response.id,
    title: response.title,
    text: response.text,
    prompt_id: promptId,
    response_id: response.id,
  };
}

export function mapAskResponseToDomain(
  response: AskResponse
): DomainResponse[] {
  return response.responses.map((r) => mapResponseToDomain(r, response.id));
}

interface MappedAnnotation {
  id: string;
  title: string;
  responses: UIResponse[];
}

export function mapAnnotationsToDomain(
  response: AnnotationsResponse
): MappedAnnotation[] {
  return response.data.map(
    (prompt: AnnotationPrompt): MappedAnnotation => ({
      id: prompt.id,
      title: prompt.prompt,
      responses: prompt.responses.map((response: AnnotationResponse) => ({
        id: response.id,
        title: response.title,
        text: response.text,
        prompt_id: prompt.id,
        response_id: response.id,
      })),
    })
  );
}
