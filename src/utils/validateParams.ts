
import { URL } from "url";  

export default function validatedQueryParams(requestUrl: URL) {
    let name: string = "";
    let dateAndTime: string = "";
    let scheduleMeetLink: string = "";
    let description: string = "";

    try {
        if (requestUrl.searchParams.get("name")) {
            name = requestUrl.searchParams.get("name")!;
        }

        if (!!!name) throw "name is invalid"; // name is required
    } catch (err) {
        throw "Invalid input query parameter: name";
    }

    try {
        if (requestUrl.searchParams.get("dateAndTime")) {
            dateAndTime = requestUrl.searchParams.get("dateAndTime")!;
        }

        if (!!!dateAndTime) throw "dateAndTime is invalid"; // dateAndTime is required
    } catch (err) {
        throw "Invalid input query parameter: dateAndTime";
    }

    try {
        if (requestUrl.searchParams.get("scheduleMeetLink")) {
            scheduleMeetLink = requestUrl.searchParams.get("scheduleMeetLink")!;
        }

        if (!!!scheduleMeetLink) throw "scheduleMeetLink is invalid"; // scheduleMeetLink is required
    } catch (err) {
        throw "Invalid input query parameter: scheduleMeetLink";
    }

    try {
        if (requestUrl.searchParams.get("description")) {
            description = requestUrl.searchParams.get("description")!;
        }

        if (!!!description) throw "description is invalid"; // description is required
    } catch (err) {
        throw "Invalid input query parameter: description";
    }

    return {
        name,
        dateAndTime,
        scheduleMeetLink,
        description,
    };
}