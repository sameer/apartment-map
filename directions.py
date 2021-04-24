#!/bin/python
import googlemaps
import pandas
import os
from datetime import datetime, timezone, timedelta

OFFICE = 'Put your office here'
# Maximum time you're willing to wait
MAX_DIRECTIONS_DURATION_SECS = 60 * 15
TIMEZONE = timezone(timedelta(hours=-7))
# When you leave for work i.e. 7:15 AM on a Monday
DEPARTURE_TIME = str(int(datetime(2021, 4, 26, 7, 15, 00, tzinfo=TIMEZONE).timestamp()))


gmaps = googlemaps.Client(key=os.environ['API_KEY'])

apartments_df = pandas.read_csv("apartments.tsv", delimiter='\t')
apartment_addresses = apartments_df.address.tolist()
distance = []
duration = []
fare = []
for apartment_address in apartment_addresses:
    distance_matrix_response = gmaps.distance_matrix(
        OFFICE,
        apartment_address,
        mode='transit',
        transit_mode='rail',
        traffic_model='pessimistic',
        departure_time=DEPARTURE_TIME
    )
    distance_matrix_row_element = distance_matrix_response['rows'][0]['elements'][0]
    
    try:
        distance.append(distance_matrix_row_element['distance']['value'])
    except KeyError:
        distance.append('N/A')
    try:
        duration.append(distance_matrix_row_element['duration']['value'])
    except KeyError:
        duration.append('N/A')
    try:
        fare.append(distance_matrix_row_element['fare']['text'])
    except KeyError:
        fare.append('N/A')
    print(distance[-1], duration[-1], fare[-1])

apartments_df['distance'] = distance
apartments_df['duration_mins'] = apartments_df['duration'] / 60
apartments_df['fare'] = fare
apartments_df = apartments_df[apartments_df['duration'] < MAX_DIRECTIONS_DURATION_SECS]
apartments_df = apartments_df.sort_values(by='duration')
apartments_df.to_csv('apartments-with-distance.tsv', sep='\t', index=False)
