import { defineConfig, env } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
    datasource: {
        url: env('DiRECT_URL'),
    }
})