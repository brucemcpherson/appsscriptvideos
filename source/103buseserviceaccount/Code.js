function oneOffSetting() { 
  
  // used by all using this script
  var propertyStore = PropertiesService.getScriptProperties();
 
  // service account for cloud vision
  // DriveApp.getFiles()
  cGoa.GoaApp.setPackage (propertyStore , 
    cGoa.GoaApp.createServiceAccount (DriveApp , {
      packageName: 'cloudvision_serviceaccount',
      fileId:'0B92ExLh4POiZNUJqMDhrM1M5LWM',
      scopes : cGoa.GoaApp.scopesGoogleExpand (['cloud-platform']),
      service:'google_service'
    }));

}


function useServiceAccount() {
  
  // get the token
  var goa = cGoa.GoaApp.createGoa(
      'cloudvision_serviceaccount', 
      PropertiesService.getScriptProperties()
    ).execute();
  
  // check we have one
  if (!goa.hasToken()) {
    throw 'should have been a token';
  }
  
  // use it
  var endPoint = "https://vision.googleapis.com/v1/images:annotate";

  // get an image
  var image = DriveApp.getFileById("0B92ExLh4POiZV2QzQVEzUTRIOWc");
  
  // encode it into a query
  var body = { 
    requests: [{
      features: [{
          "type":"LABEL_DETECTION",
          "maxResults":5
        }],
        image: { 
          content: Utilities.base64Encode(image.getBlob().getBytes())
        }
    }]
  };
  
  // send it to cloud vision, using the access token
  var response = UrlFetchApp.fetch ( endPoint, {
    method: "POST",
    payload: JSON.stringify(body),
    contentType: "application/json",
    headers: {
      Authorization:'Bearer ' + goa.getToken()
    }
  });
  
 // show the result
  Logger.log(response.getContentText());
}

