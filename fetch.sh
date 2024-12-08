#!/usr/bin/env  bash
curl -I 'https://geoserver3.pea.powerschool.com/geoserver/wms?service=wms&version=1.1.0&REQUEST=GetMap&FORMAT=application/json&SRS=EPSG:900913&TRANSPARENT=true&VERSION=1.1.0&&layers=dimi-dynamic:SchoolBoundaries_Middle&bbox=-13589892.132878058,4493274.270715799,-13588669.140425494,4494497.263168365&viewparams=StudyId:214830' \
-H User-Agent: 'Mozilla/5.0 Gecko/20100101 Firefox/130.0' \
-H Accept-Language: 'en-US,en;q=0.5' \
-H Accept-Encoding: 'gzip, deflate, br, zstd' \
-H Referer: https://locator.pea.powerschool.com/ \
-H Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2MTNEMkMxMjMxREM1RDUzOEMwRDMyOTNCMTkxMDZEM0Y0MDNEQjYiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJsaFBTd1NNZHhkVTR3Tk1wT3hrUWJUOUFQYlkifQ.eyJuYmYiOjE3MzMyNTUzOTYsImV4cCI6MTczMzI1ODk5NiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5wZWEucG93ZXJzY2hvb2wuY29tIiwiYXVkIjpbImh0dHBzOi8vYWNjb3VudHMucGVhLnBvd2Vyc2Nob29sLmNvbS9yZXNvdXJjZXMiLCJsb2NhdG9yIl0sImNsaWVudF9pZCI6IjQyMkE0NzVELTdFNzEtNDc3Qi1BOUY2LUQ2QjBFODA3OTVCMi5sb2NhdG9yLmRpbWktYXBwcy5jb20iLCJzdHVkeWlkIjoiMjE0ODMwIiwiZGlzdHJpY3RpZCI6IjEzNTAiLCJyb2xlIjoiNDIyQTQ3NUQtN0U3MS00NzdCLUE5RjYtRDZCMEU4MDc5NUIyLmxvY2F0b3IuZGltaS1hcHBzLmNvbSIsInNjb3BlIjpbImxvY2F0b3IiXX0.hXCXizPdTu7mhCc-h3P5aHsv2laLqIllwLwy28CtISU9Zdrd6lp1cHMjsEBicUw-WmWxiPycvFJwM5Nrkmw02jyi19FdGHNDFslDXi5E3s3Yi4t1AU4hbKI6XEve0I98Ro5fROErucylC_wKff8jagtE09dTpYNR5tki5BwotQNvGoHn9LCW_SZjfECBsNS3umwlMwHIzwvjX__znaTxAEmb4SRdIHPOWIWw4OeII_2N9yjtFYRi7WRpwMkCJ2otiaA3VLkLd5dnHIU-OLawcB7s0tRFTocDtWRl7BfOBRjENhouaZ5CfB4I_KU91lTcF0VH_HwW5_WrGMNWRHyTD_qv384Zt8RaSpJL68nD9VTNpAKZQ7i78xG1mMVoaGZqUmHsoSxWcB3uWMOCLAFYlM_E6KdszyZjtQ7zFSwV93QKl9Fg6u81eiD57tAU5aiXmntLVtYStziWPTxx0n-cSofWohwMs0Xe8pBB--UTwl4V1tUemeQzwxAew3ne9gJuc4aWgJBmsb6YgClpwAo8HydtyzGAQOFUjMc1zLoLT7wrixr70xEc6LgmP9xyOMAVehKvgMRx2yBywlYiD0xhZojPoOv9c1YlXF7tBp3YMCxj2CjoCS9Tyg4uu1hnG4ewiPF5WR4NP5PQH97MHP4Cp6R8PlN_Uv17u62MOPJ69sU \
-H Origin: https://locator.pea.powerschool.com \
-H DNT: 1 \
-H Sec-GPC: 1 \
-H Connection: keep-alive \
-H Sec-Fetch-Dest: empty \
-H Sec-Fetch-Mode: cors \
-H Sec-Fetch-Site: same-site \
-H Priority: u=4 \
-H TE: trailer
