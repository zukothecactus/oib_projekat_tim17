console.clear();
import app from './app';

const port = process.env.PORT || 5200;

app.listen(port, () => {
  console.log(`\x1b[32m[Processing@1.0]\x1b[0m localhost:${port}`);
});
