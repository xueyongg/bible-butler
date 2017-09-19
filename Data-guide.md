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

## CurrencyInterval
the currency that have been archived in Marvin and is set to be intervally sent to user

```JavaScript
{
    "verse": String,
    "text": String,
    "counter": Integer
}

## WeatherInterval
The weather temperature is to be sent to me by Marvin at 8am, 12pm, 6pm and 10pm

```JavaScript
{
    "intervalId": Username + "_" + location
    "username": String,
    "hour": String,
    "location": Integer
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

