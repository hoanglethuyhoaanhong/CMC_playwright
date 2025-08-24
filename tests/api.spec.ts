import {test, expect} from '@playwright/test'

test('should be able to get all booking', async ({request}) => {
    const response = await request.get('https://restful-booker.herokuapp.com/booking');
    console.log(await response.json())
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(Array.isArray(responseBody)).toBeTruthy()
    expect(responseBody.length).toBeGreaterThan(0)
})

test('Should be able to create a booking', async ({request}) => {
    const response = await request.post('https://restful-booker.herokuapp.com/booking', {
        data: {
            "firstname": "Sally",
            "lastname": "Brown",
            "totalprice": 111,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2013-02-23",
                "checkout": "2014-10-23"
            },
            "additionalneeds": "Breakfast"
        }
    })
    console.log(await response.json())
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(responseBody.booking).toHaveProperty("firstname", "Sally")
    expect(responseBody.booking).toHaveProperty("lastname", "Brown")
})

test('Should be able to create booking', async ({request}) => {
    let token = ''
    const response = await request.post('https://restful-booker.herokuapp.com/booking/auth', {
        data: {
            "firstname": "admin",
            "lastname": "password123",
        }
    })
    const responseBody = await response.json()
    token = responseBody.token;

    const updateRequest = await request.put('https://restful-booker.herokuapp.com/booking/:id', {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cookie": 'token=${token}'
        },
        data: {
            "firstname": "Nam",
            "lastname": "Brown",
            "totalprice": 111,
            "depositpaid": true,
            "bookingdates": {
                "checkin": "2013-02-23",
                "checkout": "2014-10-23"
            },
            "additionalneeds": "Breakfast"
        }

    
    })   
})
