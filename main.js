'use strict';

require('./gitApi');
require('./staticFiles');
require('./fsAccess');
require('./fsWatch');
require('./server').listen(process.env.PORT || 3000);
