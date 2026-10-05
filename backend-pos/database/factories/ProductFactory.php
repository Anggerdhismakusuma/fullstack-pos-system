<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => 'SKU-' . $this->faker->unique()->numerify('####'),
            'name' => $this->faker->words(2, true),
            'price' => $this->faker->numberBetween(5, 50) * 1000, // Harga antara Rp 5.000 - Rp 50.000
            'stock' => $this->faker->numberBetween(20, 100),
            'image' => null,
        ];
    }
}
