export class MethodNames {
    /* Ethereum: Hotel Manager */
    public static readonly QUERY_CLIENT_BALANCE_ETHEREUM = "queryClientBalance";
    public static readonly IS_ROOM_AVAILABLE = "isRoomAvailable";
    public static readonly QUERY_ROOM_PRICE = "queryRoomPrice";
    public static readonly CHANGE_ROOM_PRICE = "changeRoomPrice";
    public static readonly ADD_TO_CLIENT_BALANCE_ETHEREUM = "addToClientBalance";
    public static readonly BOOK_ROOM = "bookRoom";
    public static readonly HAS_RESERVATION_ETHEREUM = "hasReservation";
    public static readonly CHECKOUT = "checkout";
    /* Fabric: Flight Manager */
    public static readonly QUERY_CLIENT_BALANCE_FABRIC = "queryClientBalance_Fabric";
    public static readonly HAS_RESERVATION_FABRIC = "hasReservation_Fabric";
    public static readonly ADD_TO_CLIENT_BALANCE_FABRIC = "addToClientBalance_Fabric";
    public static readonly IS_SEAT_AVAILABLE = "isSeatAvailable";
    public static readonly IS_A_SEAT_AVAILABLE = "isASeatAvailable";
    public static readonly QUERY_NEXT_AVAILABLE_SEAT = "queryNextAvailableSeat";
    public static readonly IS_SEAT_BOOKED_BY_CLIENT = "isSeatBookedByClient";
    public static readonly QUERY_SEATS_COUNT = "querySeatsCount";
    public static readonly CHANGE_SEATS_COUNT = "changeSeatsCount";
    public static readonly QUERY_BOOKED_SEATS_COUNT = "queryBookedSeatsCount";
    public static readonly CHANGE_SEAT_PRICE = "changeSeatPrice";
    public static readonly QUERY_SEAT_PRICE = "querySeatPrice";
    public static readonly BOOK_SEAT = "bookSeat";
    public static readonly END_FLIGHT = "endFlight";
    
    public static readonly FLIGHT_MANAGER_FUNCTIONS = [
        MethodNames.QUERY_CLIENT_BALANCE_FABRIC,
        MethodNames.HAS_RESERVATION_FABRIC,
        MethodNames.ADD_TO_CLIENT_BALANCE_FABRIC,
        MethodNames.IS_SEAT_AVAILABLE,
        MethodNames.IS_A_SEAT_AVAILABLE,
        MethodNames.QUERY_NEXT_AVAILABLE_SEAT,
        MethodNames.IS_SEAT_BOOKED_BY_CLIENT,
        MethodNames.QUERY_SEATS_COUNT,
        MethodNames.CHANGE_SEATS_COUNT,
        MethodNames.QUERY_BOOKED_SEATS_COUNT,
        MethodNames.CHANGE_SEAT_PRICE,
        MethodNames.QUERY_SEAT_PRICE,
        MethodNames.BOOK_SEAT,
        MethodNames.END_FLIGHT
    ];
    
    public static readonly HOTEL_MANAGER_FUNCTIONS = [
        MethodNames.QUERY_CLIENT_BALANCE_ETHEREUM,
        MethodNames.IS_ROOM_AVAILABLE,
        MethodNames.QUERY_ROOM_PRICE,
        MethodNames.CHANGE_ROOM_PRICE,
        MethodNames.ADD_TO_CLIENT_BALANCE_ETHEREUM,
        MethodNames.BOOK_ROOM,
        MethodNames.HAS_RESERVATION_ETHEREUM,
        MethodNames.CHECKOUT
    ];

    public static readonly START = "DtxStart";
    public static readonly REGISTER = "DtxRegister";
    public static readonly COMMIT = "DtxCommit";
    public static readonly ABORT = "DtxAbort";
    public static readonly IS_ABORTED = "DtxIsAborted";
}