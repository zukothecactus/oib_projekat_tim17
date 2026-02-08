console.clear();
import app from './app';

const port = process.env.PORT || 5007;

app.listen(port, () => {
  console.log(`\x1b[32m[Sales@1.0]\x1b[0m localhost:${port}`);
});
