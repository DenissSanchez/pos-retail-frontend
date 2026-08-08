import { Card, CardContent, Typography, Box } from "@mui/material";

export default function StatCard({
    title,
    value,
    icon,
    color = "#2563eb"
}) {

    return (

        <Card elevation={3}>

            <CardContent>

                <Box

sx={{

display:"flex",

justifyContent:"space-between",

alignItems:"center"

}}

>

                    <Box>

                        <Typography
                            color="text.secondary"
                            fontSize={14}
                        >

                            {title}

                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                        >

                            {value}

                        </Typography>

                    </Box>

                    <Box
                        sx={{
                            bgcolor: color,
                            color: "#fff",
                            p: 2,
                            borderRadius: 2
                        }}
                    >

                        {icon}

                    </Box>

                </Box>

            </CardContent>

        </Card>

    );

}