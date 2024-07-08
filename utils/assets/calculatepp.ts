interface CalculatePpParams {
  beatmap_id: number;
  nkatu: number;
  ngeki: number;
  n100: number;
  n50: number;
  misses: number;
  mods: number;
  mode: number;
  combo: number;
}

export async function calculatePp(params: CalculatePpParams) {
  const { beatmap_id, nkatu, ngeki, n100, n50, misses, mods, mode, combo } =
    params;
  console.log(beatmap_id, nkatu, ngeki, n100, n50, misses, mods, mode, combo);

  // Construct the query string
  const queryParams = new URLSearchParams({
    id: beatmap_id?.toString(),
    nkatu: nkatu?.toString(),
    ngeki: ngeki?.toString(),
    n100: n100?.toString(),
    n50: n50?.toString(),
    misses: misses.toString(),
    mods: mods.toString(),
    mode: mode.toString(),
    combo: combo?.toString(),
  });

  try {
    const response = await fetch(
      `${process.env.V1_API}/calculate_pp?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.OSU_API}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
