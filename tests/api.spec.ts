import { test, expect } from '@playwright/test'

test.describe('GET Booking API', () => {
    let getBookingID: number
    test.beforeEach('GET Booking ID', async ({ request }) => {
        const response = await request.get('https://restful-booker.herokuapp.com/booking');
        console.log(await response.json())
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
        const responseBody = await response.json()
        console.log(responseBody)
        expect(Array.isArray(responseBody)).toBeTruthy()
        expect(responseBody.length).toBeGreaterThan(0)

        // luu bookingid
        getBookingID = responseBody[0].bookingid
        console.log('Saved booking id: ', getBookingID)
    })

    test('Should be able to get a booking by id', async ({ request }) => {
        expect(getBookingID).toBeDefined()
        const response = await request.get('https://restful-booker.herokuapp.com/booking/${getBookingID}')
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
        const responseBody = await response.json()
        console.log(responseBody)
        expect(responseBody).toHaveProperty('firstname')
        expect(responseBody).toHaveProperty('lastname')
    })

    test('Should return 404 for invalid ID', async ({ request }) => {
        const bookingID = 0
        const response = await request.get('https://restful-booker.herokuapp.com/booking/${getBookingID}')
        expect(response.status()).toBe(404)
    })

    test('Shoule be return bookings filted by firstname and lastname', async ({ request }) => {
        const firstname = 'John'
        const lastname = 'Smith'
        const response = await request.get('https://restful-booker.herokuapp.com/booking?firstname=${firstname}&lastname=${lastname}')
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
        const responseBody = await response.json()
        console.log('responseBody: ', responseBody)
        expect(responseBody.every(item => item.hasOwnProperty('bookingid'))).toBe(true)
    })
})

test.describe('POST/PUT and Authentication', () => {

    // POST
    let createdBookingID: number
    let getToken: string

    test.beforeEach('Shoule be able to create a booking', async ({ request }) => {
        const responseGetId = await request.post('https://restful-booker.herokuapp.com/booking',
            {
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
        console.log(await responseGetId.json())
        expect(responseGetId.ok()).toBeTruthy()
        expect(responseGetId.status()).toBe(200)
        const responseBody = await responseGetId.json()
        console.log(responseBody)
        expect(responseBody.booking).toHaveProperty("firstname", "Sally")
        expect(responseBody.booking).toHaveProperty("lastname", "Brown")

        // luu booking id de dung cho test sau
        createdBookingID = responseBody.bookingid
        expect(typeof createdBookingID).toBe('number')

        // test('Should be able to create an auth token)
        const responseGetToken = await request.post('https://restful-booker.herokuapp.com/auth',
            {
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "firstname": "admin",
                    "lastname": "password123",
                }
            })
        const responseBodyGetToken = await responseGetToken.json()
        console.log(responseBodyGetToken)
        expect(responseBodyGetToken.ok()).toBeTruthy()
        expect(responseBodyGetToken.status()).toBe(200)

        // Luu token
        getToken = responseBodyGetToken.token
        expect(typeof getToken).toBe('string')
        console.log(getToken)
    })

    // PUT
    test('Should be able to update an booking', async ({ request }) => {
        const updateRequest = await request.put('https://restful-booker.herokuapp.com/booking/${createdBookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": 'token=${getToken}'
                },
                data: {
                    "firstname": "Shall",
                    "lastname": "Brownn",
                    "totalprice": 111,
                    "depositpaid": true,
                    "bookingdates": {
                        "checkin": "2013-02-23",
                        "checkout": "2014-10-23"
                    },
                    "additionalneeds": "Breakfast"
                }
            })
        const responseBody = await updateRequest.json()
        console.log(responseBody)
        expect(updateRequest.ok()).toBeTruthy()
        expect(updateRequest.status()).toBe(200)
        expect(responseBody.booking).toHaveProperty("firstname", "Shall")
        expect(responseBody.booking).toHaveProperty("lastname", "Brownn")
    })

    // DELETE
    test('Should be able to delete an booking', async ({ request }) => {

        // xoa lan 1 thanh cong 
        const firstDelete = await request.delete('https://restful-booker.herokuapp.com/booking/${createdBookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": 'token=${getToken}'
                }
            })
        expect(firstDelete.status()).toBe(201)

        // xoa lan 2 that bai
        const secondDelete = await request.delete('https://restful-booker.herokuapp.com/booking/${createdBookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": 'token=${getToken}'
                }
            })
        expect(firstDelete.status()).toBe(405)
    })

    // PATCH
    test('Should be able to patch an booking', async ({ request }) => {
        const patchRequest = await request.patch('https://restful-booker.herokuapp.com/booking/${createdBookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": 'token=${getToken}'
                },
                data: {
                    "firstname": "Hoa"
                }
            })
        expect(patchRequest.status()).toBe(200)
        const responseBody = await patchRequest.json()
        console.log(responseBody)
        expect(responseBody).toHaveProperty("firstname", "Hoa")
    })
})

test.describe('Edge Cases & Negative Tests', () => {
    test('Accessing a booking with an invalid ID', async({request}) => {
        const bookingID = 0
        const response = await request.get('https://restful-booker.herokuapp.com/booking/${getBookingID}')
        expect(response.status()).toBe(404)
    })

    test('Create a booking with missing fields', async({request}) => {
        const response = await request.post('https://restful-booker.herokuapp.com/booking',
            {
                data: {
                    // missing field firstname,
                    "lastname": "Hoa",
                    "totalprice": 111,
                    "depositpaid": true,
                    "bookingdates": {
                        "checkin": "2013-02-23",
                        "checkout": "2014-10-23"
                    },
                    "additionalneeds": "Breakfast"
                }
            })
    
        expect(response.ok()).toBeTruthy() // error  
        expect(response.status()).toBe(200)
    })
    
    test('Updating a booking without authentication', async({request}) => {
        let bookingID = '101'
        const updateRequest = await request.put('https://restful-booker.herokuapp.com/booking/${bookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                data: {
                    "firstname": "Shall",
                    "lastname": "Brownn",
                    "totalprice": 111,
                    "depositpaid": true,
                    "bookingdates": {
                        "checkin": "2013-02-23",
                        "checkout": "2014-10-23"
                    },
                    "additionalneeds": "Breakfast"
                }
            })
            expect(updateRequest.status()).toBe(403)
    })

    test('Deleted without authentication', async({request}) => {
        let bookingID = '101'
        const deleteRequest = await request.delete('https://restful-booker.herokuapp.com/booking/${bookingID}',
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            })
        expect(deleteRequest.status()).toBe(403)
    })
})
