
angular.module('app')
    .constant('DSP_URL', 'http://129.232.165.173:80')
    .constant('DSP_SERVICE', 'TankersCCP_DB')
    .constant('APP_API_KEY', '9650d8a9a59cd956b0203121c4cceccec0059409d40997ff61ea0ea31ed2a9cc')
    .constant('DSP_SYSTEM_REQUEST_URL', 'http://129.232.165.173:80/rest/system/')
    .constant('DSP_FILE_UPLOAD_URL', 'http://129.232.165.173:80/api/v2/TankTainerSA_FILES/TankersCCP')
    .constant('DSP_FILE_DOWNLOAD_URL', 'http://129.232.165.173:80/api/v2/TankTainerSA_FILES/')
    .constant('DSP_REQUEST_URL_QUERY', 'http://129.232.165.173:80/api/v2/TankersCCP_DB/_table/')
    .constant('DSP_REQUEST_URL_USER', 'http://129.232.165.173:80/api/v2/user/')
    .constant('DSP_REQUEST_URL_PROC', 'http://129.232.165.173:80/api/v2/TankersCCP_DB/_proc/')
    .constant('DSP_REQUEST_URL_FUNC', 'http://129.232.165.173:80/api/v2/TankersCCP_DB/_func/')
    .constant('APP_NAME', 'TankersCCP')
    .constant('APP_VERSION', '0.3')
    .constant('CONST_SIC',
    {
        'SIC1': 'Agriculture, forestry and fishing (SIC1)',
        'SIC2': 'Mining and quarrying (SIC2)',
        'Sic3': 'Manufacturing (SIC3)',
        'Sic4': 'Electricity, Gas and Water supply (SIC4)',
        'SIC6': 'Wholesale and retail trade; Repair of motor vehicles, motor cycles and personal and household goods; Hotels and restaurants (SIC6)',
        'SIC7': 'Transport, Storage and Communication (SIC7)',
        'Sic8': 'Financial Intermediation, Insurance, Real Estate, and Business Services (SIC8)',
        'Sic9': 'Community Social and Personal Services, as well as Government Services (SIC9&10)',
        'Sic10': 'Community Social and Personal Services, as well as Government Services (SIC9&10)'
    })
    .constant('CONST_STRUCTURE',
    {
        '01_MonoCentric': 'Mono-centric',
        '02_BiCentric': 'Bi-centric',
        '03_PolyCentric': 'Poly-centric',
        '04_ScatteredClusters': 'Scattered clusters',
        '05_ScatteredDense': 'Scattered dense',
        '06_ScatteredSparse': 'Scattered sparse',
        '07_Dense': 'Dense',
        '08_SparseLinear': 'Sparse linear',
        '09_DenseLinear': 'Dense linear',
    })
    .constant('CONST_PROVINCE',
    {
        'EC': 'Eastern Cape',
        'FS': 'Free State',
        'GP': 'Gauteng',
        'KZN': 'KwaZulu-Natal',
        'LIM': 'Limpopo',
        'MP': 'Mpumalanga',
        'NW': 'North West',
        'NC': 'Northern Cape',
        'WC': 'Western Cape',
    })
    .constant('CONST_ORDER',
    {
        '1': 'City Region',
        '2': 'Cities',
        '3': 'Regional Centre',
        '4': 'Admin Centre / Service Town',
        '5': 'Dense Township / Homeland areas',
        '6': 'Town (60 000 persons)',
        '7': 'Small Town (40 000 persons)',
        '8': 'Small Town (20 000 persons)',
        '9': 'Small Catchment (10 000 persons)',
        '10': 'Very Small Catchment (10 000 persons)',
    })
    .config(['$httpProvider', 'APP_API_KEY', function ($httpProvider, APP_API_KEY) {
        $httpProvider.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
    }])
    .constant('_', _);


