const redirect = {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.hostname = "jsonprism.com";
    url.port = "";
    // Preserve paths and queries; browsers retain the original fragment.
    return Response.redirect(url.href, 308);
  },
};
export default redirect;
