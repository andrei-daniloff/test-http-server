pm2

```js
	require('fs').appendFileSync('/Users/mrmlnc/Documents/OpenSource/frmwrk/test/launch.json', JSON.stringify({
		monit: proc.monit,
		axm: proc.pm2_env.axm_monitor,
	})+ '\n');
```
