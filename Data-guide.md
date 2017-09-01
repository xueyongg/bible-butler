## User
user details 

```JavaScript
{
    "username": String,
    "password": String,
    "profile": 
        {
            "createdAt": Date(),
            "birthday": String,
            "firstName": String,
            "lastName": String,
            "chatId": String,
        },
    "bb": Boolean,

}

## Location
the location that users want to get to find out their location

```JavaScript
{
    "name": String,
    "lat": String,
    "long": String
}

## Verses
the verses that have been archived in Marvin

```JavaScript
{
    "verse": String,
    "text": String,
    "counter": Integer
}

## Holidays depreciated
all the holidays that are retrived for 2017 and beyond

```JavaScript
{
    "availableCountries": [String],
    "countries": 
        {
            <countryName>: 
                {
                    <year>: 
                        {
                            <month>: 
                            [
                                {
                                    "_id": <countryName>_<year>_<month>_<date>,
                                    "name": String,
                                    "date": Date
                                }
                            ]
                        }
                    
                }
        }
}

