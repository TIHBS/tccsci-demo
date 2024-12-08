export enum ScFunction {
  /* Hotel Manager */
  QUERY_CLIENT_BALANCE = "queryClientBalance",
  IS_ROOM_AVAILABLE = "isRoomAvailable",
  QUERY_ROOM_PRICE = "queryRoomPrice",
  CHANGE_ROOM_PRICE = "changeRoomPrice",
  ADD_TO_CLIENT_BALANCE = "addToClientBalance",
  BOOK_ROOM = "bookRoom",
  HAS_RESERVATION = "hasReservation",
  CHECKOUT = "checkout",

  /* Flight Manager */
  QUERY_CLIENT_BALANCE_FABRIC = "queryClientBalance_Fabric",
  HAS_RESERVATION_FABRIC = "hasReservation_Fabric",
  ADD_TO_CLIENT_BALANCE_FABRIC = "addToClientBalance_Fabric",
  IS_SEAT_AVAILABLE = "isSeatAvailable",
  IS_A_SEAT_AVAILABLE = "isASeatAvailable",
  QUERY_NEXT_AVAILABLE_SEAT = "queryNextAvailableSeat",
  IS_SEAT_BOOKED_BY_CLIENT = "isSeatBookedByClient",
  QUERY_SEATS_COUNT = "querySeatsCount",
  CHANGE_SEAT_COUNT = "changeSeatCount",
  QUERY_BOOKED_SEATS_COUNT = "queryBookedSeatsCount",
  CHANGE_SEAT_PRICE = "changeSeatPrice",
  QUERY_SEAT_PRICE = "querySeatPrice",
  BOOK_SEAT = "bookSeat",
  END_FLIGHT = "endFlight"
}
