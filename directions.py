#!/bin/python
import googlemaps
import pandas
import os

OFFICE = 'Put your office here'
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
        traffic_model='pessimistic'
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
apartments_df['duration'] = duration
apartments_df['fare'] = fare
apartments_df.to_csv('apartments-with-distance.tsv', sep='\t', index=False)
