sut = require('../../data/TripletAggregator').aggregate

describe "TripletAggregator.aggregate()", ->


  it "should return null when null input", ->
    output = sut null
    expect(output).toBe null


  it "should return input when it is an empty array", ->
    input = []
    output = sut input
    expect(output).toEqual input


  it 'should return correct output for single item in input array', ->
    input = [
      startResource:
        id: 'startResource'
      connection: 'connection'
      endResource:
        id: 'endResource'
    ]
    output = sut input
    expect(output).toContain
      startResource:
        id: 'startResource'
      endResource:
        id: 'endResource'
      connections: [
        'connection'
      ]


  it 'should return correct output for two items in input array (no parallel connection)', ->
    input = [
        startResource:
            id: 'startResource1'
        connection: 'connection1'
        endResource:
          id: 'endResource1'
      ,
        startResource:
          id: 'startResource2'
        connection: 'connection2'
        endResource:
          id: 'endResource2'
    ]
    output = sut input
    expect(output).toContain
      startResource:
        id: 'startResource1'
      endResource:
        id: 'endResource1'
      connections: [
        'connection1'
      ]
    expect(output).toContain
      startResource:
        id: 'startResource2'
      endResource:
        id: 'endResource2'
      connections: [
        'connection2'
      ]


  it 'should aggregate two parallel connections', ->
    input = [
      startResource:
        id: 'startResource1'
      connection: 'connection1'
      endResource:
        id: 'endResource1'
    ,
      startResource:
        id: 'startResource1'
      connection: 'connection2'
      endResource:
        id: 'endResource1'
    ]
    output = sut input
    expect(output.length).toBe 1
    expect(output[0].connections).toContain 'connection1'
    expect(output[0].connections).toContain 'connection2'


  it 'should aggregate two parallel connections in an input array of three', ->
    input = [
      startResource:
        id: 'startResource3'
      connection: 'connection3'
      endResource:
        id: 'endResource3'
    ,
      startResource:
        id: 'startResource1'
      connection: 'connection1'
      endResource:
        id: 'endResource1'
    ,
      startResource:
        id: 'startResource1'
      connection: 'connection2'
      endResource:
        id: 'endResource1'
    ]
    output = sut input
    expect(output.length).toBe 2
    expect(output).toContain
      startResource:
        id: 'startResource1'
      endResource:
        id: 'endResource1'
      connections: [
        'connection1'
        'connection2'
      ]
    expect(output).toContain
      startResource:
        id: 'startResource3'
      endResource:
        id: 'endResource3'
      connections: [
        'connection3'
      ]

  it 'should return aggregated parallel connections of both direction', ->
    input = [
      startResource:
        id: 'startResource'
      connection: 'connection1'
      endResource:
        id: 'endResource'
    ,
      startResource:
        id: 'endResource'
      connection: 'connection2'
      endResource:
        id: 'startResource'
    ]
    output = sut input
    expect(output.length).toBe 1