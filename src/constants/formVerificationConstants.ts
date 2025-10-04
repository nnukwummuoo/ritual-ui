export type formVerificationConstants = {
    firstName: string,
    lastName: string,
    email: string,
    dob: string,
    country: string,
    city: string,
    address: string,
    idPhotofile: File | null; // Changed from string | null to File | null
    holdingIdPhotofile: File | null;
    //idPhoto: string,
    //holdingIdPhoto: string,
    userid: string,
    documentType: string,
    idexpire: string,
  }